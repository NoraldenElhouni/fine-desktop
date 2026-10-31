import React, { useState } from "react";
import { CalendarClock, Printer } from "lucide-react";
import type { Sale } from "../../api/endpoints/sales";
import { salesErrorMessage } from "../../api/endpoints/sales";
import {
  INSTALLMENT_STATUS_CHIP,
  INSTALLMENT_STATUS_LABEL,
  InstallmentLine,
  InstallmentPlan,
} from "../../api/endpoints/installments";
import { useAddInstallmentPlan, usePaymentAccounts } from "../../hooks/useSales";
import { formatDate, formatInteger, formatNumber, localDateIso } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Cell, PrintDialog, PrintDocument, PrintTable, money } from "../print/PrintDocument";
import { InstallmentPlanFields, buildInstallmentPlan, defaultInstallmentDraft } from "./InstallmentPlanFields";

const amount = (v: number | string): string => formatNumber(v, { maximumFractionDigits: 3 });
const statusLabel = (l: InstallmentLine): string => l.status_label || INSTALLMENT_STATUS_LABEL[l.status] || l.status;

export const InstallmentStatusChip: React.FC<{ line: Pick<InstallmentLine, "status" | "status_label"> }> = ({ line }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
      INSTALLMENT_STATUS_CHIP[line.status] ?? "bg-app-fill-f1 text-app-label-secondary"
    }`}
  >
    {line.status_label || INSTALLMENT_STATUS_LABEL[line.status] || line.status}
  </span>
);

const saleBuyer = (sale: Sale): string => sale.client?.entity?.name ?? "—";

/** The schedule printed on A4 for the client to keep. */
const InstallmentSchedulePrint: React.FC<{ sale: Sale; plan: InstallmentPlan }> = ({ sale, plan }) => {
  const phone = sale.client?.entity?.primary_contact?.phone;
  return (
    <PrintDocument
      title="جدول أقساط"
      number={sale.order_number}
      date={sale.created_at}
      meta={[
        { label: "العميل", value: saleBuyer(sale) },
        ...(phone ? [{ label: "الهاتف", value: <span dir="ltr">{phone}</span> }] : []),
        { label: "إجمالي البيع", value: money(sale.total_amount) },
        { label: "الدفعة المقدمة", value: money(plan.down_payment) },
        { label: "المبلغ المقسّط", value: money(plan.financed_amount) },
        { label: "عدد الأقساط", value: `${formatInteger(plan.installment_count)} (${plan.frequency_label})` },
        { label: "المتبقي من الأقساط", value: money(plan.totals.remaining) },
        { label: "الحالة حتى", value: formatDate(plan.as_of) },
      ]}
      signatures={["العميل", "البائع"]}
      footerNote="أقساط بلا فوائد. تُخصم كل دفعة من أقدم قسط مستحق أولاً، والمرتجع يُنقص الأقساط الأخيرة أولاً."
    >
      <PrintTable head={["#", "تاريخ الاستحقاق", "قيمة القسط", "المدفوع", "المتبقي", "الحالة"]}>
        {plan.lines.map((l) => (
          <tr key={l.id}>
            <Cell className="font-mono">{l.number}</Cell>
            <Cell className="font-mono">{formatDate(l.due_date)}</Cell>
            <Cell className="text-end font-mono">{amount(l.amount)}</Cell>
            <Cell className="text-end font-mono">{amount(l.paid_amount)}</Cell>
            <Cell className="text-end font-mono">{amount(l.remaining)}</Cell>
            <Cell>{statusLabel(l)}</Cell>
          </tr>
        ))}
        <tr className="font-bold">
          <Cell colSpan={2}>الإجمالي</Cell>
          <Cell className="text-end font-mono">{amount(plan.totals.amount)}</Cell>
          <Cell className="text-end font-mono">{amount(plan.totals.paid)}</Cell>
          <Cell className="text-end font-mono">{amount(plan.totals.remaining)}</Cell>
          <Cell />
        </tr>
      </PrintTable>
    </PrintDocument>
  );
};

/** The sale's local calendar date — the earliest first due date the backend accepts. */
const saleDate = (sale: Sale): string => localDateIso(new Date(sale.created_at));

/** POST /sales/{id}/installment-plan: schedule what a sold receivable sale still owes. */
const AddInstallmentPlanDialog: React.FC<{ sale: Sale; outstanding: number; onClose: () => void }> = ({
  sale,
  outstanding,
  onClose,
}) => {
  const addPlan = useAddInstallmentPlan();
  const { data: treasuries = [] } = usePaymentAccounts();
  const [draft, setDraft] = useState(defaultInstallmentDraft);
  const [serverError, setServerError] = useState<string | null>(null);
  const earliest = saleDate(sale);
  const built = buildInstallmentPlan(draft, outstanding, earliest);

  const submit = () => {
    if (!built.input) return;
    setServerError(null);
    addPlan.mutate(
      { saleId: sale.id, ...built.input },
      {
        onSuccess: () => {
          toast.success("تم إنشاء جدول الأقساط");
          onClose();
        },
        onError: (err) => setServerError(salesErrorMessage(err, "تعذّر إنشاء جدول الأقساط.")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-app-accent" />
            تقسيط المتبقي على {sale.order_number}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          <p className="text-xs text-app-label-secondary">
            المتبقي على البيع <span className="font-mono font-bold text-app-label-primary">{formatNumber(outstanding)}</span> د.ل.
            الدفعة المقدمة (إن وُجدت) تُحصَّل الآن، ويُقسَّم الباقي على أقساط شهرية متساوية.
          </p>
          <InstallmentPlanFields
            draft={draft}
            onChange={setDraft}
            owed={outstanding}
            earliestDueDate={earliest}
            treasuries={treasuries}
            error={built.error}
          />
          {serverError && (
            <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
              {serverError}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!built.input || addPlan.isPending}
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            {addPlan.isPending ? "جارٍ الحفظ…" : "إنشاء جدول الأقساط"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface InstallmentScheduleSectionProps {
  sale: Sale;
  outstanding: number;
  /** The user may put this sale on installments (create-sales). */
  canAddPlan: boolean;
}

/**
 * W5-08: the sale's installment schedule with each installment's status and a
 * printable copy; on a sold receivable sale without one, the button that adds it.
 */
export const InstallmentScheduleSection: React.FC<InstallmentScheduleSectionProps> = ({ sale, outstanding, canAddPlan }) => {
  const [printing, setPrinting] = useState(false);
  const [adding, setAdding] = useState(false);
  const plan = sale.installment_plan ?? null;

  if (!plan) {
    const eligible =
      canAddPlan &&
      sale.payment_method === "receivable" &&
      sale.buyer_type === "client" &&
      Boolean(sale.client_id) &&
      (sale.status === "open" || sale.status === "completed") &&
      outstanding > 0.0001;
    if (!eligible) return null;
    return (
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 flex flex-wrap items-center gap-3">
        <CalendarClock className="h-4 w-4 text-app-accent" />
        <span className="text-xs text-app-label-secondary">
          بيع آجل دون جدول أقساط — يمكن تقسيط المتبقي على أقساط شهرية.
        </span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="ms-auto rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
        >
          تقسيط المتبقي
        </button>
        {adding && <AddInstallmentPlanDialog sale={sale} outstanding={outstanding} onClose={() => setAdding(false)} />}
      </div>
    );
  }

  const overdue = Number(plan.totals.overdue);

  return (
    <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
      <div className="border-b border-app-separator px-4 py-3 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
          <CalendarClock className="w-4 h-4 text-app-accent" /> جدول الأقساط
        </h2>
        <span className="text-[11px] text-app-label-secondary">
          {formatInteger(plan.installment_count)} {plan.installment_count === 1 ? "قسط" : "أقساط"} {plan.frequency_label}
          {" · "}المقسّط <span className="font-mono">{formatNumber(plan.financed_amount)}</span>
          {Number(plan.down_payment) > 0 && (
            <> · دفعة مقدمة <span className="font-mono">{formatNumber(plan.down_payment)}</span></>
          )}
          {" · "}المتبقي <span className="font-mono font-bold text-app-label-primary">{formatNumber(plan.totals.remaining)}</span>
          {overdue > 0.0001 && (
            <> · متأخر <span className="font-mono font-bold text-app-status-danger">{formatNumber(overdue)}</span></>
          )}
        </span>
        <button
          type="button"
          onClick={() => setPrinting(true)}
          className="ms-auto flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
        >
          <Printer className="w-4 h-4" /> طباعة الجدول
        </button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
            <th className="px-4 py-2 text-start font-semibold">#</th>
            <th className="px-3 py-2 text-start font-semibold">تاريخ الاستحقاق</th>
            <th className="px-3 py-2 text-end font-semibold">قيمة القسط</th>
            <th className="px-3 py-2 text-end font-semibold">المدفوع</th>
            <th className="px-3 py-2 text-end font-semibold">المتبقي</th>
            <th className="px-3 py-2 text-start font-semibold">الحالة</th>
            <th className="px-3 py-2 text-end font-semibold">أيام التأخير</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-separator">
          {plan.lines.map((l) => {
            const cut = Math.abs(Number(l.scheduled_amount) - Number(l.amount)) > 0.0001;
            return (
              <tr key={l.id} className={l.status === "overdue" ? "bg-app-status-danger/5" : ""}>
                <td className="px-4 py-2 font-mono">{l.number}</td>
                <td className="px-3 py-2 font-mono">{formatDate(l.due_date)}</td>
                <td className="px-3 py-2 text-end font-mono">
                  {amount(l.amount)}
                  {cut && (
                    <div className="text-[10px] text-app-label-tertiary" title="خُفّض بسبب مرتجع">
                      من {amount(l.scheduled_amount)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-end font-mono text-app-label-secondary">{amount(l.paid_amount)}</td>
                <td className="px-3 py-2 text-end font-mono font-bold">{amount(l.remaining)}</td>
                <td className="px-3 py-2"><InstallmentStatusChip line={l} /></td>
                <td className={`px-3 py-2 text-end font-mono ${l.days_overdue > 0 ? "font-bold text-app-status-danger" : "text-app-label-tertiary"}`}>
                  {l.days_overdue > 0 ? formatInteger(l.days_overdue) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-app-separator bg-app-bg-secondary/40">
          <tr className="font-bold">
            <td colSpan={2} className="px-4 py-2 text-end text-app-label-secondary">الإجمالي</td>
            <td className="px-3 py-2 text-end font-mono">{amount(plan.totals.amount)}</td>
            <td className="px-3 py-2 text-end font-mono">{amount(plan.totals.paid)}</td>
            <td className="px-3 py-2 text-end font-mono">{amount(plan.totals.remaining)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
      <p className="px-4 py-2 text-[10px] text-app-label-tertiary border-t border-app-separator">
        تُحسب حالة الأقساط من تحصيلات هذا البيع (أقدم قسط أولاً) حتى {formatDate(plan.as_of)}. سندات القبض العامة على حساب
        العميل لا تُخصم من الأقساط.
      </p>

      <PrintDialog open={printing} onClose={() => setPrinting(false)} title="طباعة جدول الأقساط">
        <InstallmentSchedulePrint sale={sale} plan={plan} />
      </PrintDialog>
    </div>
  );
};
