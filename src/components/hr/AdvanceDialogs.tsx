import React, { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { SearchableSelect } from "../ui/SearchableSelect";
import { TreasurySelect } from "../treasury/TreasurySelect";
import { AdvanceStatusChip } from "../table-columns/employeeAdvancesColumns";
import {
  ADVANCE_ENTRY_KIND_LABEL,
  ADVANCE_TYPE_LABEL,
  INSTALLMENT_STATUS_LABEL,
  advanceErrorMessage,
  formatAdvanceMoney,
  monthlyInstallment,
  type EmployeeAdvance,
  type EmployeeAdvanceType,
} from "../../api/endpoints/employeeAdvances";
import { useEmployeeAdvance, usePayAdvance, useRepayAdvance, useRequestAdvance } from "../../hooks/useEmployeeAdvances";
import { useEmployees } from "../../hooks/useEmployees";
import { useHrSettings } from "../../hooks/useHr";
import { formatDate, formatDateTime, formatNumber } from "../../lib/utils/format";
import type { Employee } from "../../types/entities";

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none";
const labelClass = "block text-xs font-semibold text-app-label-secondary mb-1";
const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";

/** This month on the machine's clock, YYYY-MM. */
export const currentPeriod = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{message}</span>
  </div>
);

const employeeName = (a: EmployeeAdvance) => a.employee?.name ?? a.employee_id.slice(0, 8);

// ─── Request ────────────────────────────────────────────────────────────────

interface RequestAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The employee card fixes the employee; the advances page lets HR pick one. */
  employee?: Employee;
}

/** HR requests an advance or loan; the server checks the limits (HR-12). */
export const RequestAdvanceDialog: React.FC<RequestAdvanceDialogProps> = ({ open, onOpenChange, employee }) => {
  const [employeeId, setEmployeeId] = useState(employee?.id ?? "");
  const [type, setType] = useState<EmployeeAdvanceType>("advance");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("1");
  const [startPeriod, setStartPeriod] = useState(currentPeriod());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: employees = [] } = useEmployees();
  const { data: settings } = useHrSettings();
  const request = useRequestAdvance();

  // Terminated employees cannot take an advance (ADVANCE_EMPLOYEE_INACTIVE).
  const options = useMemo(() => employees.filter((e) => e.status !== "terminated"), [employees]);
  const selected = employee ?? options.find((e) => e.id === employeeId) ?? null;

  const amountValue = Number(amount);
  const count = Number(installments);
  const monthly = amountValue > 0 && Number.isInteger(count) && count >= 1 ? monthlyInstallment(amountValue, count) : 0;
  const last = monthly > 0 ? Math.round((amountValue - monthly * (count - 1)) * 1000) / 1000 : 0;

  const multiple = settings?.advance_max_salary_multiple ?? 1;
  const pct = settings?.advance_max_deduction_pct ?? 50;
  const salary = selected?.pay_type === "monthly" ? Number(selected.monthly_salary ?? 0) : 0;

  const reset = () => {
    setEmployeeId(employee?.id ?? "");
    setType("advance");
    setAmount("");
    setInstallments("1");
    setStartPeriod(currentPeriod());
    setNotes("");
    setError(null);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    request.mutate(
      {
        employee_id: selected.id,
        type,
        amount: amountValue,
        installments: count,
        start_period: startPeriod,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => close(false),
        onError: (err) => setError(advanceErrorMessage(err, "تعذر تسجيل الطلب.")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>طلب سلفة أو قرض</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <ErrorBox message={error} />}
          <form id="advance-request-form" onSubmit={submit} className="space-y-3">
            {!employee && (
              <div>
                <label className={labelClass}>الموظف</label>
                <SearchableSelect<Employee>
                  options={options}
                  value={selected}
                  onChange={(emp) => setEmployeeId(emp ? emp.id : "")}
                  getOptionId={(emp) => emp.id}
                  getOptionLabel={(emp) => emp.entity?.name ?? emp.job_title ?? emp.id}
                  getOptionSubLabel={(emp) => [emp.employee_number, emp.job_title].filter(Boolean).join(" · ")}
                  getOptionSearchText={(emp) => `${emp.entity?.name ?? ""} ${emp.employee_number ?? ""} ${emp.job_title ?? ""}`}
                  placeholder="الموظف…"
                  required
                />
              </div>
            )}

            {selected && (
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-[11px] text-app-label-secondary space-y-1">
                {salary > 0 ? (
                  <>
                    <div>
                      الراتب الشهري الساري: <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(salary)} د.ل</span>
                    </div>
                    <div>
                      أقصى مبلغ للسلفة ({formatNumber(multiple)} × الراتب):{" "}
                      <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(salary * multiple)} د.ل</span>
                    </div>
                    <div>
                      أقصى استقطاع شهري لكل السلف المفتوحة ({formatNumber(pct)}٪ من الراتب):{" "}
                      <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney((salary * pct) / 100)} د.ل</span>
                    </div>
                  </>
                ) : (
                  <div className="text-app-status-yellow">
                    السلف والقروض للموظفين على راتب شهري فقط — هذا الموظف ليس على راتب شهري، وسيُرفض الطلب.
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>النوع</label>
                <select value={type} onChange={(e) => setType(e.target.value as EmployeeAdvanceType)} className={inputClass}>
                  {(Object.keys(ADVANCE_TYPE_LABEL) as EmployeeAdvanceType[]).map((t) => (
                    <option key={t} value={t}>
                      {ADVANCE_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>المبلغ (د.ل)</label>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>عدد الأقساط الشهرية</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  required
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>شهر بداية الاسترداد</label>
                <input
                  type="month"
                  required
                  min={currentPeriod()}
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            {monthly > 0 && (
              <p className="text-[11px] text-app-label-secondary">
                القسط الشهري: <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(monthly)} د.ل</span>
                {count > 1 && last !== monthly && (
                  <>
                    {" "}— القسط الأخير:{" "}
                    <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(last)} د.ل</span>
                  </>
                )}
                . يُستقطع آلياً من مسير الرواتب بعد صرف السلفة.
              </p>
            )}

            <div>
              <label className={labelClass}>ملاحظات (اختياري)</label>
              <input
                type="text"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="advance-request-form"
            disabled={request.isPending || !selected || !(amountValue > 0) || !(count >= 1) || !startPeriod}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {request.isPending ? "جارٍ الإرسال…" : "تسجيل الطلب"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Pay out / repay ────────────────────────────────────────────────────────

interface CashDialogProps {
  advance: EmployeeAdvance | null;
  onClose: () => void;
}

/** Pay an approved advance out of a LYD treasury: DR 1215 (employee) / CR treasury. */
export const PayAdvanceDialog: React.FC<CashDialogProps> = ({ advance, onClose }) => {
  const [cashAccountId, setCashAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pay = usePayAdvance();

  const close = () => {
    setCashAccountId("");
    setError(null);
    onClose();
  };

  const submit = () => {
    if (!advance || !cashAccountId) return;
    setError(null);
    pay.mutate(
      { id: advance.id, cashAccountId },
      { onSuccess: close, onError: (err) => setError(advanceErrorMessage(err, "تعذر صرف السلفة.")) },
    );
  };

  return (
    <Dialog open={Boolean(advance)} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>صرف {advance ? ADVANCE_TYPE_LABEL[advance.type] : ""}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <ErrorBox message={error} />}
          {advance && (
            <p className="text-xs text-app-label-secondary">
              صرف <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(advance.amount)} د.ل</span> للموظف{" "}
              <span className="font-bold text-app-label-primary">{employeeName(advance)}</span>. يُرحَّل القيد: من حـ/ سلف الموظفين
              (1215) إلى حـ/ الخزينة. إن كان شهر بداية الاسترداد قد أُغلق مسيره يُنقل الجدول كاملاً إلى أول شهر مفتوح.
            </p>
          )}
          <TreasurySelect value={cashAccountId} onChange={setCashAccountId} label="الخزينة (بالدينار)" lydOnly />
        </DialogBody>
        <DialogFooter>
          <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1">
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pay.isPending || !cashAccountId}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pay.isPending ? "جارٍ الصرف…" : "صرف وترحيل"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Cash returned against a paid-out advance: DR treasury / CR 1215; shortens the schedule from its end. */
export const RepayAdvanceDialog: React.FC<CashDialogProps> = ({ advance, onClose }) => {
  const [amount, setAmount] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const repay = useRepayAdvance();

  const close = () => {
    setAmount("");
    setCashAccountId("");
    setError(null);
    onClose();
  };

  const submit = () => {
    const value = Number(amount);
    if (!advance || !cashAccountId || !(value > 0)) return;
    setError(null);
    repay.mutate(
      { id: advance.id, amount: value, cashAccountId },
      { onSuccess: close, onError: (err) => setError(advanceErrorMessage(err, "تعذر تسجيل السداد.")) },
    );
  };

  return (
    <Dialog open={Boolean(advance)} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>سداد نقدي على {advance ? ADVANCE_TYPE_LABEL[advance.type] : ""}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <ErrorBox message={error} />}
          {advance && (
            <p className="text-xs text-app-label-secondary">
              الموظف <span className="font-bold text-app-label-primary">{employeeName(advance)}</span> — المتبقي للاسترداد:{" "}
              <span className="font-mono font-bold text-app-label-primary">{formatAdvanceMoney(advance.outstanding ?? 0)} د.ل</span>.
              يُخصم السداد من آخر الأقساط أولاً، ولا يمس ما استقطعه مسير تجاوز المراجعة.
            </p>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-app-label-secondary">المبلغ المُعاد (د.ل)</label>
              {advance && (advance.outstanding ?? 0) > 0 && (
                <button
                  type="button"
                  // The exact unrounded balance: the server allows only 0.0001 over it.
                  onClick={() => setAmount(String(advance.outstanding))}
                  className="rounded-lg px-2 py-0.5 text-[11px] font-semibold text-app-accent hover:bg-app-accent/10"
                >
                  سداد كامل المتبقي
                </button>
              )}
            </div>
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <TreasurySelect value={cashAccountId} onChange={setCashAccountId} label="الخزينة المستلمة (بالدينار)" lydOnly />
        </DialogBody>
        <DialogFooter>
          <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1">
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={repay.isPending || !cashAccountId || !(Number(amount) > 0)}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {repay.isPending ? "جارٍ التسجيل…" : "تسجيل السداد"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Detail ─────────────────────────────────────────────────────────────────

interface AdvanceDetailDialogProps {
  advanceId: string | null;
  onClose: () => void;
  /** The same action buttons as the list row, for the advance as freshly loaded. */
  renderActions: (advance: EmployeeAdvance) => React.ReactNode;
  /** A refusal from one of those actions, shown here because the dialog covers the list. */
  actionError?: string | null;
}

/** One advance: its terms, the recovery schedule and the entries posted against it. */
export const AdvanceDetailDialog: React.FC<AdvanceDetailDialogProps> = ({ advanceId, onClose, renderActions, actionError }) => {
  const { data: advance, isLoading, isError, error } = useEmployeeAdvance(advanceId);

  const rows: { label: string; value: React.ReactNode }[] = advance
    ? [
        { label: "الموظف", value: employeeName(advance) + (advance.employee?.deleted_at ? " (محذوف)" : "") },
        { label: "النوع", value: ADVANCE_TYPE_LABEL[advance.type] },
        { label: "المبلغ", value: <span className="font-mono">{formatAdvanceMoney(advance.amount)} د.ل</span> },
        {
          label: "الأقساط",
          value: (
            <span className="font-mono">
              {advance.installments} × {formatAdvanceMoney(advance.monthly_amount)}
            </span>
          ),
        },
        { label: "بداية الاسترداد", value: <span className="font-mono">{advance.start_period}</span> },
        { label: "المسترد", value: <span className="font-mono">{formatAdvanceMoney(advance.recovered ?? 0)} د.ل</span> },
        { label: "المتبقي", value: <span className="font-mono">{formatAdvanceMoney(advance.outstanding ?? 0)} د.ل</span> },
        { label: "الخزينة", value: advance.cash_account?.name ?? "—" },
        { label: "قيد الصرف", value: advance.payout_entry ? <span className="font-mono">{advance.payout_entry.reference}</span> : "—" },
        { label: "طلبها", value: advance.requested_by?.name ?? "—" },
        {
          label: "اعتمدها",
          value: advance.approved_by
            ? `${advance.approved_by.name}${advance.approved_at ? ` — ${formatDateTime(advance.approved_at)}` : ""}`
            : "—",
        },
        { label: "تاريخ الصرف", value: advance.paid_at ? formatDateTime(advance.paid_at) : "—" },
        ...(advance.settled_at ? [{ label: "تاريخ السداد الكامل", value: formatDateTime(advance.settled_at) }] : []),
        ...(advance.cancelled_at ? [{ label: "تاريخ الإلغاء", value: formatDateTime(advance.cancelled_at) }] : []),
        ...(advance.notes ? [{ label: "ملاحظات", value: advance.notes }] : []),
      ]
    : [];

  return (
    <Dialog open={Boolean(advanceId)} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="3xl">
        <DialogHeader>
          <DialogTitle>
            {advance ? `${ADVANCE_TYPE_LABEL[advance.type]} — ${employeeName(advance)}` : "تفاصيل السلفة"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-4">
          {actionError && <ErrorBox message={actionError} />}
          {isLoading ? (
            <p className="py-10 text-center text-xs text-app-label-secondary">جارٍ التحميل…</p>
          ) : isError || !advance ? (
            <ErrorBox message={advanceErrorMessage(error, "تعذر تحميل السلفة.")} />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <AdvanceStatusChip status={advance.status} />
              </div>

              {advance.payout_reversed && (
                <ErrorBox message="عُكس قيد صرف هذه السلفة في دفتر اليومية بينما ما زالت مفتوحة — راجعها مع قسم الحسابات." />
              )}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 rounded-xl border border-app-separator">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 border-b border-app-separator px-4 py-2.5">
                    <dt className="text-xs font-semibold text-app-label-secondary">{row.label}</dt>
                    <dd className="text-xs font-bold text-app-label-primary text-end">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h4 className="mb-2 text-xs font-bold text-app-label-primary">جدول الأقساط</h4>
                <div className="overflow-hidden rounded-xl border border-app-separator">
                  <table className="w-full">
                    <thead className="border-b border-app-separator bg-app-bg-secondary">
                      <tr>
                        <th className={th}>الشهر</th>
                        <th className={th}>القسط</th>
                        <th className={th}>المحصّل</th>
                        <th className={th}>المتبقي</th>
                        <th className={th}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(advance.schedule ?? []).map((row) => (
                        <tr key={row.id} className="border-b border-app-separator last:border-0">
                          <td className={`${td} font-mono`}>{row.period}</td>
                          <td className={`${td} font-mono`}>{formatAdvanceMoney(row.amount)}</td>
                          <td className={`${td} font-mono`}>{formatAdvanceMoney(row.recovered_amount)}</td>
                          <td className={`${td} font-mono`}>{formatAdvanceMoney(row.remaining)}</td>
                          <td className={td}>{INSTALLMENT_STATUS_LABEL[row.status] ?? row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(advance.schedule ?? []).length === 0 && (
                    <p className="p-4 text-xs text-app-label-secondary">لا توجد أقساط.</p>
                  )}
                </div>
                {advance.status === "paid" && (
                  <p className="mt-1.5 text-[11px] text-app-label-tertiary">
                    ما لا يُسترد من قسط في شهره (حد الاستقطاع أو صافي الراتب) يبقى مستحقاً ويُستقطع في المسير التالي.
                  </p>
                )}
              </div>

              {(advance.entries ?? []).length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-bold text-app-label-primary">القيود المرحّلة</h4>
                  <div className="overflow-hidden rounded-xl border border-app-separator">
                    <table className="w-full">
                      <thead className="border-b border-app-separator bg-app-bg-secondary">
                        <tr>
                          <th className={th}>المرجع</th>
                          <th className={th}>التاريخ</th>
                          <th className={th}>النوع</th>
                          <th className={th}>المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(advance.entries ?? []).map((entry) => (
                          <tr key={entry.id} className="border-b border-app-separator last:border-0">
                            <td className={`${td} font-mono`}>{entry.reference}</td>
                            <td className={td}>{entry.entry_date ? formatDate(entry.entry_date) : "—"}</td>
                            <td className={td}>{ADVANCE_ENTRY_KIND_LABEL[entry.kind] ?? entry.kind}</td>
                            <td className={`${td} font-mono`}>{formatAdvanceMoney(entry.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogBody>
        <DialogFooter>
          {advance && <div className="me-auto">{renderActions(advance)}</div>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
          >
            إغلاق
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
