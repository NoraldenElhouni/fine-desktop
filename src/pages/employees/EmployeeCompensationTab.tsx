import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useCreateCompensation, useDeleteCompensation, useEmployeeCompensations } from "../../hooks/useEmployees";
import { employeeErrorMessage, type EmployeeCompensation } from "../../api/endpoints/employees";
import { formatDate, formatNumber, localDateIso } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import type { Employee } from "../../types/entities";

const PAY_TYPE_LABEL: Record<EmployeeCompensation["pay_type"], string> = {
  monthly: "راتب شهري",
  hourly: "بالساعة",
  piece_rate: "بالقطعة",
};

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";
const input =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none focus:border-app-accent";
const label = "block text-xs font-semibold text-app-label-secondary mb-1";

const money = (v: number | null) => (v === null ? "—" : formatNumber(v));

interface Props {
  employee: Employee;
  /** hr-manager, owner or accounting-manager (HR-10): may record or remove a pay change. */
  canChangePay: boolean;
}

/** HR-11: the employee's dated pay history and the pay-change dialog. */
export const EmployeeCompensationTab: React.FC<Props> = ({ employee, canChangePay }) => {
  const { data: history = [], isLoading, isError } = useEmployeeCompensations(employee.id);
  const remove = useDeleteCompensation();
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [toRemove, setToRemove] = useState<EmployeeCompensation | null>(null);

  const today = localDateIso();
  // History is newest first: the version in force is the first one already effective.
  const current = history.find((v) => v.effective_from <= today) ?? history[history.length - 1];
  const opening = history[history.length - 1];

  const confirmRemove = () => {
    if (!toRemove) return;
    remove.mutate(
      { employeeId: employee.id, compensationId: toRemove.id },
      {
        onSuccess: () => {
          toast.success("تم حذف تغيير الأجر");
          setToRemove(null);
        },
        onError: (err) => {
          setToRemove(null);
          toast.error(employeeErrorMessage(err, "تعذر حذف تغيير الأجر."));
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-separator p-3">
        <p className="text-[11px] text-app-label-secondary">
          كل تغيير في الأجر يسري من تاريخه، ويحتسب المسير الأجر يوماً بيوم ويوزّعه نسبياً عند تغيّره خلال الشهر.
        </p>
        {canChangePay && (
          <button
            onClick={() => setIsChangeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            تغيير الأجر
          </button>
        )}
      </div>

      <table className="w-full">
        <thead className="bg-app-bg-secondary border-b border-app-separator">
          <tr>
            <th className={th}>يسري من</th>
            <th className={th}>نوع الأجر</th>
            <th className={th}>الراتب الشهري</th>
            <th className={th}>أجر الساعة</th>
            <th className={th}>السبب</th>
            <th className={th}>سجّله</th>
            {canChangePay && <th className={th} />}
          </tr>
        </thead>
        <tbody>
          {history.map((version) => {
            const isCurrent = current?.id === version.id;
            const isScheduled = version.effective_from > today;
            return (
              <tr key={version.id} className="border-b border-app-separator last:border-0">
                <td className={`${td} font-mono`}>
                  <div className="flex items-center gap-2">
                    {formatDate(version.effective_from)}
                    {isCurrent && (
                      <span className="rounded-full bg-app-status-positive/10 px-2 py-0.5 text-[10px] font-bold text-app-status-positive">
                        الساري
                      </span>
                    )}
                    {isScheduled && (
                      <span className="rounded-full bg-app-status-yellow/15 px-2 py-0.5 text-[10px] font-bold text-app-status-yellow">
                        مجدول
                      </span>
                    )}
                  </div>
                </td>
                <td className={td}>{PAY_TYPE_LABEL[version.pay_type] ?? version.pay_type}</td>
                <td className={`${td} font-mono`}>{money(version.monthly_salary)}</td>
                <td className={`${td} font-mono`}>
                  {version.hourly_rate === null && version.pay_type === "hourly" ? (
                    <span className="text-app-label-tertiary">حسب الدور</span>
                  ) : (
                    money(version.hourly_rate)
                  )}
                </td>
                <td className={td}>{version.reason || "—"}</td>
                <td className={td}>
                  <div>{version.creator?.name ?? "—"}</div>
                  {version.created_at && (
                    <div className="text-[10px] text-app-label-tertiary font-mono">{formatDate(version.created_at)}</div>
                  )}
                </td>
                {canChangePay && (
                  <td className={`${td} text-end`}>
                    {/* The opening terms start the history at the hire date and cannot be removed. */}
                    {version.id !== opening?.id && (
                      <button
                        onClick={() => setToRemove(version)}
                        className="rounded-lg p-1.5 text-app-status-danger hover:bg-app-status-danger/10"
                        aria-label="حذف تغيير الأجر"
                        title="حذف تغيير الأجر"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
      {isError && <p className="p-4 text-xs text-app-status-danger">تعذر تحميل سجل الراتب.</p>}
      {!isLoading && !isError && history.length === 0 && (
        <p className="p-4 text-xs text-app-label-secondary">لا يوجد سجل راتب لهذا الموظف بعد.</p>
      )}

      <Dialog open={isChangeOpen} onOpenChange={setIsChangeOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>تغيير الأجر</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {isChangeOpen && (
            <ChangeForm employee={employee} current={current} history={history} onDone={() => setIsChangeOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={toRemove !== null}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        isLoading={remove.isPending}
        title="حذف تغيير الأجر"
        message={
          toRemove
            ? `سيُحذف تغيير الأجر الساري من ${formatDate(toRemove.effective_from)} ويعود الأجر السابق ساريًا. التصحيح يكون بالحذف ثم تسجيل التغيير الصحيح.`
            : ""
        }
        confirmText="حذف"
        variant="danger"
      />
    </>
  );
};

const ChangeForm: React.FC<{
  employee: Employee;
  current?: EmployeeCompensation;
  history: EmployeeCompensation[];
  onDone: () => void;
}> = ({ employee, current, history, onDone }) => {
  const create = useCreateCompensation();
  const [error, setError] = useState<string | null>(null);
  const [payType, setPayType] = useState<"monthly" | "hourly">(current?.pay_type === "hourly" ? "hourly" : "monthly");
  const [monthlySalary, setMonthlySalary] = useState(current?.monthly_salary != null ? String(current.monthly_salary) : "");
  const [hourlyRate, setHourlyRate] = useState(current?.hourly_rate != null ? String(current.hourly_rate) : "");
  const [effectiveFrom, setEffectiveFrom] = useState(localDateIso());
  const [reason, setReason] = useState("");

  // An hourly employee without a labor role has no role rate to fall back on.
  const hourlyRateRequired = payType === "hourly" && !employee.labor_role;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!effectiveFrom) {
      setError("حدد تاريخ سريان التغيير.");
      return;
    }
    // The backend refuses these with an English INVALID_COMPENSATION reason; catch them here in Arabic.
    const hireDate = employee.hire_date ? employee.hire_date.slice(0, 10) : "";
    if (hireDate && effectiveFrom < hireDate) {
      setError(`لا يسري تغيير الأجر قبل تاريخ التعيين (${formatDate(hireDate)}).`);
      return;
    }
    const earliest = history[history.length - 1];
    if (earliest && effectiveFrom < earliest.effective_from) {
      setError(`لا يسري تغيير الأجر قبل بداية سجل الراتب (${formatDate(earliest.effective_from)}).`);
      return;
    }
    if (history.some((v) => v.effective_from === effectiveFrom)) {
      setError("يوجد تغيير أجر بنفس التاريخ؛ اختر تاريخاً آخر أو احذف التغيير القائم أولاً.");
      return;
    }
    if (payType === "monthly" && monthlySalary.trim() === "") {
      setError("أدخل الراتب الشهري.");
      return;
    }
    if (hourlyRateRequired && hourlyRate.trim() === "") {
      setError("موظف بالساعة بلا دور عمالي يحتاج أجر ساعة شخصياً.");
      return;
    }
    create.mutate(
      {
        employeeId: employee.id,
        payload: {
          pay_type: payType,
          monthly_salary: payType === "monthly" ? Number(monthlySalary) : null,
          hourly_rate: payType === "hourly" && hourlyRate.trim() !== "" ? Number(hourlyRate) : null,
          effective_from: effectiveFrom,
          reason: reason.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تسجيل تغيير الأجر");
          onDone();
        },
        onError: (err) => setError(employeeErrorMessage(err, "تعذر تسجيل تغيير الأجر.")),
      },
    );
  };

  return (
    <>
      <DialogBody>
        <form id="compensation-form" onSubmit={submit} className="space-y-4" dir="rtl">
          {error && (
            <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>نوع الأجر</label>
              <select className={input} value={payType} onChange={(e) => setPayType(e.target.value as "monthly" | "hourly")}>
                <option value="monthly">راتب شهري ثابت</option>
                <option value="hourly">أجر بالساعة</option>
              </select>
            </div>
            <div>
              <label className={label}>
                يسري من <span className="text-app-status-danger">*</span>
              </label>
              <input type="date" className={input} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} required />
            </div>
            {payType === "monthly" ? (
              <div>
                <label className={label}>
                  الراتب الشهري (د.ل) <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${input} font-mono`}
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label className={label}>
                  أجر الساعة (د.ل) {hourlyRateRequired && <span className="text-app-status-danger">*</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${input} font-mono`}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  required={hourlyRateRequired}
                />
                {!hourlyRateRequired && (
                  <p className="mt-1 text-[10px] text-app-label-tertiary">
                    اتركه فارغاً ليُحتسب بأجر الدور «{employee.labor_role}» الساري يوم العمل.
                  </p>
                )}
              </div>
            )}
            <div>
              <label className={label}>السبب</label>
              <input
                className={input}
                value={reason}
                maxLength={255}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: زيادة سنوية"
              />
            </div>
          </div>
          <p className="text-[11px] text-app-label-tertiary">
            لا يسري تغيير قبل تاريخ التعيين أو داخل شهر تجاوز مسيره المراجعة. إن مسّ التغيير مسيراً محسوباً فيجب إعادة احتسابه قبل إرساله للاعتماد.
          </p>
        </form>
      </DialogBody>
      <DialogFooter>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="compensation-form"
          disabled={create.isPending}
          className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          {create.isPending ? "جارٍ الحفظ…" : "تسجيل التغيير"}
        </button>
      </DialogFooter>
    </>
  );
};

export default EmployeeCompensationTab;
