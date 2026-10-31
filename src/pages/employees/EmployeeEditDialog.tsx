import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { useEmployeeCompensations, useUpdateEmployee } from "../../hooks/useEmployees";
import { useWorkShifts } from "../../hooks/useHr";
import { employeeErrorMessage } from "../../api/endpoints/employees";
import { formatDate, formatNumber, localDateIso } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import type { Employee, EmployeeStatus, UpdateEmployeePayload } from "../../types/entities";

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: "على رأس العمل",
  on_leave: "في إجازة",
  terminated: "منتهية خدمته",
};

const input =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none focus:border-app-accent";
const label = "block text-xs font-semibold text-app-label-secondary mb-1";

const day = (v?: string | null) => (v ? v.slice(0, 10) : "");
const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

/**
 * Mirrors EmployeeController::assertContractDates (whose 422 messages are English):
 * contract end and probation end not before the contract start, termination not
 * before the hire date or the contract start. Dates are YYYY-MM-DD, so strings compare.
 */
function contractDateError(d: {
  hireDate: string;
  contractStart: string;
  contractEnd: string;
  probationEnd: string;
  terminationDate: string;
}): string | null {
  if (d.contractStart && d.contractEnd && d.contractEnd < d.contractStart) {
    return "نهاية العقد لا تسبق بداية العقد.";
  }
  if (d.contractStart && d.probationEnd && d.probationEnd < d.contractStart) {
    return "نهاية فترة التجربة لا تسبق بداية العقد.";
  }
  if (d.terminationDate && d.hireDate && d.terminationDate < d.hireDate) {
    return "تاريخ انتهاء الخدمة لا يسبق تاريخ التعيين.";
  }
  if (d.terminationDate && d.contractStart && d.terminationDate < d.contractStart) {
    return "تاريخ انتهاء الخدمة لا يسبق بداية العقد.";
  }
  return null;
}

interface Props {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The caller holds a pay role, so the card carries the bank details and may change them. */
  canEditBank: boolean;
  /** HR-14: the caller holds a pay role, so may assign or change the work shift (WORK_SHIFT_FORBIDDEN otherwise). */
  canAssignShift: boolean;
}

/**
 * Edits the employee card (PUT /employees/{id}). Pay type and rates are not here:
 * they change through a dated pay change in the «سجل الراتب» tab (HR-11).
 */
export const EmployeeEditDialog: React.FC<Props> = ({ employee, open, onOpenChange, canEditBank, canAssignShift }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {/* Remounts on each open so the form starts from the current card. */}
        {open && (
          <EditForm
            employee={employee}
            canEditBank={canEditBank}
            canAssignShift={canAssignShift}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const EditForm: React.FC<{ employee: Employee; canEditBank: boolean; canAssignShift: boolean; onDone: () => void }> = ({
  employee,
  canEditBank,
  canAssignShift,
  onDone,
}) => {
  const update = useUpdateEmployee();
  // Shares the «سجل الراتب» tab's cache; used to keep a hire-date move and a role change valid.
  const { data: history = [] } = useEmployeeCompensations(employee.id);
  const [error, setError] = useState<string | null>(null);
  // The version the form's values were read from. The employee prop refetches while the
  // dialog is open (window focus, the 409 handler); sending its newer version with these
  // older values would silently overwrite another user's edit instead of conflicting.
  const [baseVersion] = useState(employee.record_version ?? 0);
  const [employeeNumber, setEmployeeNumber] = useState(employee.employee_number ?? "");
  const [jobTitle, setJobTitle] = useState(employee.job_title ?? "");
  const [laborRole, setLaborRole] = useState(employee.labor_role ?? "");
  const [status, setStatus] = useState<EmployeeStatus>(employee.status);
  const [hireDate, setHireDate] = useState(day(employee.hire_date));
  const [contractStart, setContractStart] = useState(day(employee.contract_start));
  const [contractEnd, setContractEnd] = useState(day(employee.contract_end));
  const [probationEnd, setProbationEnd] = useState(day(employee.probation_end));
  const [terminationDate, setTerminationDate] = useState(day(employee.termination_date));
  const [bankName, setBankName] = useState(employee.bank_name ?? "");
  const [bankAccount, setBankAccount] = useState(employee.bank_account ?? "");
  const [workShiftId, setWorkShiftId] = useState(employee.work_shift_id ?? "");
  const { data: workShifts = [], isSuccess: shiftsLoaded } = useWorkShifts();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!jobTitle.trim() || !hireDate) {
      setError("المسمى الوظيفي وتاريخ التعيين مطلوبان.");
      return;
    }
    const dateError = contractDateError({ hireDate, contractStart, contractEnd, probationEnd, terminationDate });
    if (dateError) {
      setError(dateError);
      return;
    }
    // History is newest first: the hire date moves the opening version and must stay before the next one.
    const secondVersion = history.length > 1 ? history[history.length - 2] : undefined;
    if (hireDate !== day(employee.hire_date) && secondVersion && hireDate >= secondVersion.effective_from) {
      setError(
        `يسري تغيير أجر من ${formatDate(secondVersion.effective_from)}؛ يجب أن يبقى تاريخ التعيين قبله. احذف ذلك التغيير أولاً إن لزم.`,
      );
      return;
    }
    // An hourly version without a personal rate is paid at the labor role's rate; with the
    // role cleared it has no rate and the whole payroll calculation would be refused. Any
    // version in force in a month whose payroll may still be (re)calculated counts, so
    // check every version in force from the start of the previous month onward.
    if (orNull(laborRole) === null && employee.labor_role) {
      const now = new Date();
      const cutoff = localDateIso(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      // History is newest first: a version is in force until the next newer one starts.
      const relyOnRole =
        (employee.pay_type === "hourly" && employee.hourly_rate == null) ||
        history.some(
          (v, i) =>
            v.pay_type === "hourly" &&
            v.hourly_rate === null &&
            (i === 0 || day(history[i - 1].effective_from) > cutoff),
        );
      if (relyOnRole) {
        setError("موظف بالساعة بلا أجر شخصي يحتاج دوراً عمالياً؛ سجّل أجر ساعة من «سجل الراتب» أولاً.");
        return;
      }
    }
    const payload: UpdateEmployeePayload = {
      employee_number: orNull(employeeNumber),
      job_title: jobTitle.trim(),
      labor_role: orNull(laborRole),
      status,
      hire_date: hireDate,
      contract_start: orNull(contractStart),
      contract_end: orNull(contractEnd),
      probation_end: orNull(probationEnd),
      termination_date: orNull(terminationDate),
      record_version: baseVersion,
      // Bank details are sent only by the roles that see them; anyone else would
      // be sending a blank over the stored value (BANK_DETAILS_FORBIDDEN).
      ...(canEditBank ? { bank_name: orNull(bankName), bank_account: orNull(bankAccount) } : {}),
      // HR-14: only the pay roles move an employee to another shift.
      ...(canAssignShift ? { work_shift_id: workShiftId || null } : {}),
    };
    update.mutate(
      { id: employee.id, payload },
      {
        onSuccess: () => {
          toast.success("تم حفظ بيانات الموظف");
          onDone();
        },
        onError: (err) => setError(employeeErrorMessage(err, "تعذر حفظ بيانات الموظف.")),
      },
    );
  };

  return (
    <>
      <DialogBody>
        <form id="employee-edit-form" onSubmit={submit} className="space-y-4" dir="rtl">
          {error && (
            <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>
                المسمى الوظيفي <span className="text-app-status-danger">*</span>
              </label>
              <input className={input} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
            </div>
            <div>
              <label className={label}>الرقم الوظيفي</label>
              <input className={input} value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
            </div>
            <div>
              <label className={label}>الدور العمالي (للربط بتكلفة الإنتاج)</label>
              <input
                className={input}
                value={laborRole}
                onChange={(e) => setLaborRole(e.target.value)}
                placeholder="مثال: operator, tailor, cutter"
              />
            </div>
            <div>
              <label className={label}>الحالة</label>
              <select className={input} value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
                {(Object.keys(EMPLOYEE_STATUS_LABEL) as EmployeeStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {EMPLOYEE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-app-separator bg-app-bg-secondary/50 p-3 space-y-3">
            <div className="text-xs font-bold text-app-label-primary">بيانات العقد</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>
                  تاريخ التعيين <span className="text-app-status-danger">*</span>
                </label>
                <input type="date" className={input} value={hireDate} onChange={(e) => setHireDate(e.target.value)} required />
              </div>
              <div>
                <label className={label}>بداية العقد</label>
                <input type="date" className={input} value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
              </div>
              <div>
                <label className={label}>نهاية العقد</label>
                <input type="date" className={input} value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
              </div>
              <div>
                <label className={label}>نهاية فترة التجربة</label>
                <input type="date" className={input} value={probationEnd} onChange={(e) => setProbationEnd(e.target.value)} />
              </div>
              <div>
                <label className={label}>تاريخ انتهاء الخدمة</label>
                <input
                  type="date"
                  className={input}
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[11px] text-app-label-tertiary">
              تصحيح تاريخ التعيين ينقل بداية سجل الراتب معه، ويُرفض إن غيّر قسيمة في مسير تجاوز المراجعة.
            </p>
          </div>

          <div>
            <label className={label}>الوردية (لاحتساب الساعات الإضافية)</label>
            {canAssignShift ? (
              <select className={input} value={workShiftId} onChange={(e) => setWorkShiftId(e.target.value)}>
                <option value="">بدون وردية (إعدادات الشركة الافتراضية)</option>
                {/* The stored shift stays selectable while the list loads, and if it was deleted since
                    (sending it back is not a change), so the form never clears it by accident. */}
                {employee.work_shift_id && !workShifts.some((w) => w.id === employee.work_shift_id) && (
                  <option value={employee.work_shift_id}>
                    {employee.work_shift?.name ?? "الوردية الحالية"}
                    {shiftsLoaded ? " (محذوفة)" : ""}
                  </option>
                )}
                {workShifts.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {formatNumber(w.standard_hours)} س · إضافي × {formatNumber(w.overtime_multiplier)}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`${input} opacity-70`}>{employee.work_shift?.name ?? "بدون وردية"}</div>
            )}
            {!canAssignShift && (
              <p className="mt-1 text-[11px] text-app-label-tertiary">
                تعيين الوردية من صلاحية مدير الموارد البشرية أو مدير الحسابات أو المالك.
              </p>
            )}
          </div>

          {canEditBank && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>المصرف</label>
                <input className={input} value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div>
                <label className={label}>رقم الحساب المصرفي</label>
                <input className={`${input} font-mono`} dir="ltr" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
              </div>
            </div>
          )}

          <p className="text-[11px] text-app-label-tertiary">
            نوع الأجر وقيمته لا يُعدّلان من هنا؛ سجّل تغيير أجر بتاريخ سريانه من تبويب «سجل الراتب».
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
          form="employee-edit-form"
          disabled={update.isPending}
          className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          {update.isPending ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </DialogFooter>
    </>
  );
};

export default EmployeeEditDialog;
