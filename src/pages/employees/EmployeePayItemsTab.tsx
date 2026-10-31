import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmployeeAdjustmentsPanel } from "../../components/hr/EmployeeAdjustmentsPanel";
import { PayItemDialog, isOnPayroll } from "../../components/hr/PayItemDialogs";
import { useDeletePayItem, useEmployeePayItems, usePayCodes, useUpdatePayItem } from "../../hooks/usePayItems";
import {
  PAY_ITEM_CALC_LABEL,
  PAY_ITEM_KIND_LABEL,
  formatPayMoney,
  payItemErrorMessage,
  type EmployeePayItem,
} from "../../api/endpoints/payItems";
import { formatDate, localDateIso } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import type { Employee } from "../../types/entities";

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";
const iconButton = "rounded-lg p-1 text-app-label-tertiary hover:bg-app-fill-f1 disabled:opacity-40";

interface Props {
  employee: Employee;
  /** hr-manager, owner or accounting-manager (HR-10): may add, change or remove standing items. */
  canChangePay: boolean;
}

/**
 * Where an item stands for this month's payroll: inactive, ended, scheduled or in force.
 * Payroll counts whole months (EmployeePayItemService::linesFor): an item covering any
 * day of a month is paid or deducted in full for it, so the dates compare by month.
 */
const itemState = (item: EmployeePayItem, today: string): { label: string; style: string; hint?: string } => {
  const month = today.slice(0, 7);
  const fromMonth = item.effective_from.slice(0, 7);
  const toMonth = item.effective_to?.slice(0, 7) ?? null;
  if (!item.active) return { label: "موقوف", style: "bg-app-fill-f1 text-app-label-tertiary" };
  if (toMonth && toMonth < month) return { label: "منتهٍ", style: "bg-app-fill-f1 text-app-label-tertiary" };
  if (fromMonth > month) return { label: "مجدول", style: "bg-app-status-yellow/15 text-app-status-yellow" };
  const inForce = "bg-app-status-positive/10 text-app-status-positive";
  if (fromMonth === month && item.effective_from > today) {
    return { label: "ساري", style: inForce, hint: "يبدأ هذا الشهر (يُحتسب كاملاً)" };
  }
  if (toMonth === month) return { label: "ساري", style: inForce, hint: "ينتهي هذا الشهر (يُحتسب كاملاً)" };
  return { label: "ساري", style: inForce };
};

/**
 * W5-03 (HR-13): the employee card's "البدلات والاستقطاعات" tab: standing
 * allowances and deductions that recur in every month they are in force, then
 * the employee's one-off rewards and deductions.
 */
export const EmployeePayItemsTab: React.FC<Props> = ({ employee, canChangePay }) => {
  const { data: items = [], isLoading, isError, error } = useEmployeePayItems(employee.id);
  const { nameOf } = usePayCodes();
  const update = useUpdatePayItem();
  const remove = useDeletePayItem();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeePayItem | null>(null);
  const [toRemove, setToRemove] = useState<EmployeePayItem | null>(null);

  const today = localDateIso();
  const onPayroll = isOnPayroll(employee);

  const toggleActive = (item: EmployeePayItem) => {
    update.mutate(
      { employeeId: employee.id, itemId: item.id, payload: { active: !item.active, record_version: item.record_version } },
      {
        onSuccess: () => toast.success(item.active ? "تم إيقاف البند" : "تم تفعيل البند"),
        onError: (err) => toast.error(payItemErrorMessage(err, "تعذر تغيير حالة البند.")),
      },
    );
  };

  const confirmRemove = () => {
    if (!toRemove) return;
    remove.mutate(
      { employeeId: employee.id, itemId: toRemove.id },
      {
        onSuccess: () => {
          toast.success("تم حذف البند");
          setToRemove(null);
        },
        onError: (err) => {
          setToRemove(null);
          toast.error(payItemErrorMessage(err, "تعذر حذف البند."));
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-separator p-3">
        <p className="text-[11px] text-app-label-secondary">
          البدلات والاستقطاعات الثابتة تتكرر في كل شهر يسري فيه البند: تُضاف الاستحقاقات إلى إجمالي الراتب، وتُستقطع الاستقطاعات
          منه في مسير الرواتب.
          {!onPayroll && " المسير لا يصرف لهذا الموظف (منتهي الخدمة أو بالقطعة)، فلا تُضاف له بنود."}
        </p>
        {canChangePay && (
          <button
            onClick={() => setIsAddOpen(true)}
            disabled={!onPayroll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة بند ثابت
          </button>
        )}
      </div>

      <table className="w-full">
        <thead className="bg-app-bg-secondary border-b border-app-separator">
          <tr>
            <th className={th}>النوع</th>
            <th className={th}>البند</th>
            <th className={th}>الاحتساب</th>
            <th className={th}>القيمة</th>
            <th className={th}>يسري من</th>
            <th className={th}>حتى</th>
            <th className={th}>الحالة</th>
            <th className={th}>ملاحظات</th>
            {canChangePay && <th className={th} />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const state = itemState(item, today);
            return (
              <tr key={item.id} className="border-b border-app-separator last:border-0">
                <td className={td}>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      item.kind === "addition"
                        ? "bg-app-status-positive/10 text-app-status-positive"
                        : "bg-app-status-danger/10 text-app-status-danger"
                    }`}
                  >
                    {PAY_ITEM_KIND_LABEL[item.kind]}
                  </span>
                </td>
                <td className={td}>
                  <div className="flex flex-col">
                    <span>{nameOf(item.kind, item.code)}</span>
                    <span className="font-mono text-[10px] text-app-label-tertiary">{item.code}</span>
                  </div>
                </td>
                <td className={td}>{PAY_ITEM_CALC_LABEL[item.calc]}</td>
                <td className={`${td} font-mono`}>
                  {item.calc === "percent_of_base" ? `${formatPayMoney(item.value)}٪` : `${formatPayMoney(item.value)} د.ل`}
                </td>
                <td className={`${td} font-mono`}>{formatDate(item.effective_from)}</td>
                <td className={`${td} font-mono`}>{item.effective_to ? formatDate(item.effective_to) : "—"}</td>
                <td className={td}>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${state.style}`}>{state.label}</span>
                    {state.hint && <span className="whitespace-nowrap text-[10px] text-app-label-tertiary">{state.hint}</span>}
                  </div>
                </td>
                <td className={td}>{item.notes || "—"}</td>
                {canChangePay && (
                  <td className={td}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        disabled={update.isPending}
                        className="rounded-lg border border-app-separator px-2 py-0.5 text-[10px] font-bold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
                      >
                        {item.active ? "إيقاف" : "تفعيل"}
                      </button>
                      <button type="button" onClick={() => setEditing(item)} className={iconButton} aria-label="تعديل" title="تعديل">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToRemove(item)}
                        className={`${iconButton} hover:text-app-status-danger`}
                        aria-label="حذف"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
      {isError && <p className="p-4 text-xs text-app-status-danger">{payItemErrorMessage(error, "تعذر تحميل البنود.")}</p>}
      {!isLoading && !isError && items.length === 0 && (
        <p className="p-4 text-xs text-app-label-secondary">لا توجد بدلات أو استقطاعات ثابتة.</p>
      )}

      <div className="border-t border-app-separator p-3 space-y-2">
        <h3 className="text-xs font-bold text-app-label-primary">المكافآت والجزاءات لمرة واحدة</h3>
        <EmployeeAdjustmentsPanel employee={employee} />
      </div>

      {isAddOpen && <PayItemDialog open onOpenChange={setIsAddOpen} employeeId={employee.id} />}
      {editing && (
        <PayItemDialog
          key={editing.id}
          open
          onOpenChange={(next) => !next && setEditing(null)}
          employeeId={employee.id}
          item={editing}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        title="حذف بند ثابت"
        message={
          toRemove
            ? `حذف ${PAY_ITEM_KIND_LABEL[toRemove.kind]} «${nameOf(toRemove.kind, toRemove.code)}»؟ لا يُحذف بند طُبّق في مسير تجاوز المراجعة — أنهِه بتاريخ نهاية أو أوقفه بدلاً من ذلك.`
            : ""
        }
        confirmText="حذف"
        cancelText="تراجع"
        variant="danger"
        isLoading={remove.isPending}
      />
    </>
  );
};
