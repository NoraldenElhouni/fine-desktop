import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarOff, FileText, HandCoins, History, Pencil, Receipt, UserCircle } from "lucide-react";
import { useEmployee, useEmployeeAttendance, useEmployeePayslips } from "../../hooks/useEmployees";
import { ATTENDANCE_STATUS_LABEL, PAYROLL_STATUS_LABEL, advanceRecovery } from "../../api/endpoints/hr";
import { PAY_ROLES } from "../../api/endpoints/employees";
import { usePermissions } from "../../hooks/usePermissions";
import { formatDate } from "../../lib/utils/format";
import type { Employee, PayType } from "../../types/entities";
import { EmployeeEditDialog, EMPLOYEE_STATUS_LABEL as STATUS_LABEL } from "./EmployeeEditDialog";
import { EmployeeCompensationTab } from "./EmployeeCompensationTab";
import { EmployeeLeaveTab } from "./EmployeeLeaveTab";
import { EmployeeAdvancesPanel } from "../../components/hr/EmployeeAdvancesPanel";

const PAY_TYPE_LABEL: Record<PayType, string> = {
  monthly: "راتب شهري",
  hourly: "بالساعة",
  piece_rate: "بالقطعة",
};

const money = (v: string | number | null | undefined) => Number(v ?? 0).toLocaleString();

type Tab = "attendance" | "payslips" | "leave" | "advances" | "salary" | "contract";

const Pager: React.FC<{ page: number; lastPage: number; onChange: (page: number) => void }> = ({ page, lastPage, onChange }) =>
  lastPage > 1 ? (
    <div className="flex items-center justify-center gap-2 text-xs pt-3">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-lg border border-app-separator px-3 py-1.5 disabled:opacity-40"
      >
        السابق
      </button>
      <span className="text-app-label-secondary">{page} / {lastPage}</span>
      <button
        onClick={() => onChange(Math.min(lastPage, page + 1))}
        disabled={page >= lastPage}
        className="rounded-lg border border-app-separator px-3 py-1.5 disabled:opacity-40"
      >
        التالي
      </button>
    </div>
  ) : null;

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";

const dateOrDash = (v?: string | null) => (v ? formatDate(v) : "—");

/** The contract card. Bank details are in the payload only for the pay roles. */
const ContractTab: React.FC<{ employee: Employee; showBank: boolean }> = ({ employee, showBank }) => {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "الرقم الوظيفي", value: employee.employee_number || "—" },
    { label: "تاريخ التعيين", value: dateOrDash(employee.hire_date) },
    { label: "بداية العقد", value: dateOrDash(employee.contract_start) },
    { label: "نهاية العقد", value: dateOrDash(employee.contract_end) },
    { label: "نهاية فترة التجربة", value: dateOrDash(employee.probation_end) },
    { label: "تاريخ انتهاء الخدمة", value: dateOrDash(employee.termination_date) },
    ...(showBank
      ? [
          { label: "المصرف", value: employee.bank_name || "—" },
          {
            label: "رقم الحساب المصرفي",
            value: employee.bank_account ? (
              <span className="font-mono" dir="ltr">
                {employee.bank_account}
              </span>
            ) : (
              "—"
            ),
          },
        ]
      : []),
  ];
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 border-b border-app-separator px-4 py-3">
          <dt className="text-xs font-semibold text-app-label-secondary">{row.label}</dt>
          <dd className="text-xs font-bold text-app-label-primary">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

/** One employee: master data, attendance, payslips, leave, advances, pay history and contract, with an edit dialog. */
export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("attendance");
  const [attendancePage, setAttendancePage] = useState(1);
  const [payslipPage, setPayslipPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { hasRole, roleSlugs } = usePermissions();
  // HrSettingsController::update checks the exact slugs; hasRole would also pass admin roles it refuses.
  const canEditEntitlement = roleSlugs.some((s) => s === "owner" || s === "hr-manager");

  const { data: employee, isLoading, isError } = useEmployee(id);
  const attendance = useEmployeeAttendance(id, attendancePage);
  const payslips = useEmployeePayslips(id, payslipPage);

  if (isLoading) {
    return <div className="p-6 text-xs text-app-label-secondary" dir="rtl">جارٍ التحميل…</div>;
  }

  if (isError || !employee) {
    return (
      <div className="p-6 space-y-3" dir="rtl">
        <p className="text-sm text-app-status-danger">تعذر تحميل بيانات الموظف.</p>
        <button onClick={() => navigate("/employees")} className="text-xs text-app-accent">العودة إلى الموظفين</button>
      </div>
    );
  }

  // HR-10: the roles that set pay also see and set bank details; the API sends the
  // bank keys only to them, so their presence confirms the role server-side.
  const holdsPayRole = hasRole(PAY_ROLES) && "bank_name" in employee;

  const pay =
    employee.pay_type === "monthly"
      ? `${money(employee.monthly_salary)} د.ل / شهر`
      : employee.pay_type === "hourly"
        ? `${money(employee.hourly_rate)} د.ل / ساعة`
        : "—";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/employees")}
          className="rounded-xl border border-app-separator bg-app-bg-secondary p-2 hover:bg-app-fill-f1 transition-colors"
          aria-label="رجوع"
        >
          <ArrowRight className="w-4 h-4 text-app-label-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-app-accent" />
            {employee.entity?.name ?? "موظف"}
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            {employee.employee_number ? <span className="font-mono">{employee.employee_number} · </span> : null}
            {employee.job_title}
            {employee.operating_unit?.name ? ` · ${employee.operating_unit.name}` : ""}
          </p>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="ms-auto inline-flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "الحالة", value: STATUS_LABEL[employee.status] ?? employee.status },
          { label: "نوع الأجر", value: PAY_TYPE_LABEL[employee.pay_type] ?? employee.pay_type },
          { label: "الأجر", value: <span className="font-mono">{pay}</span> },
          { label: "تاريخ التعيين", value: employee.hire_date ? formatDate(employee.hire_date) : "—" },
        ].map((item) => (
          <div key={item.label} className="bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
            <div className="text-xs font-semibold text-app-label-secondary">{item.label}</div>
            <div className="text-sm font-bold text-app-label-primary mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["attendance", "الدوام", CalendarCheck],
          ["payslips", "قسائم الراتب", Receipt],
          ["leave", "الإجازات", CalendarOff],
          ["advances", "السلف والقروض", HandCoins],
          ["salary", "سجل الراتب", History],
          ["contract", "بيانات العقد", FileText],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              tab === key ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-app-bg-primary rounded-2xl border border-app-separator shadow-sm overflow-hidden">
        {tab === "leave" ? (
          <EmployeeLeaveTab employeeId={employee.id} canEditEntitlement={canEditEntitlement} />
        ) : tab === "advances" ? (
          <div className="p-3">
            <EmployeeAdvancesPanel employee={employee} />
          </div>
        ) : tab === "salary" ? (
          <EmployeeCompensationTab employee={employee} canChangePay={holdsPayRole} />
        ) : tab === "contract" ? (
          <ContractTab employee={employee} showBank={holdsPayRole} />
        ) : tab === "attendance" ? (
          <>
            <table className="w-full">
              <thead className="bg-app-bg-secondary border-b border-app-separator">
                <tr>
                  <th className={th}>التاريخ</th>
                  <th className={th}>الحالة</th>
                  <th className={th}>الساعات</th>
                  <th className={th}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {(attendance.data?.data ?? []).map((row) => (
                  <tr key={row.id} className="border-b border-app-separator last:border-0">
                    <td className={td}>{formatDate(row.work_date)}</td>
                    <td className={td}>{ATTENDANCE_STATUS_LABEL[row.status] ?? row.status}</td>
                    <td className={`${td} font-mono`}>{Number(row.hours_worked).toLocaleString()}</td>
                    <td className={td}>{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendance.isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
            {!attendance.isLoading && (attendance.data?.data ?? []).length === 0 && (
              <p className="p-4 text-xs text-app-label-secondary">لا يوجد سجل دوام.</p>
            )}
            <Pager page={attendancePage} lastPage={attendance.data?.last_page ?? 1} onChange={setAttendancePage} />
          </>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-app-bg-secondary border-b border-app-separator">
                <tr>
                  <th className={th}>الفترة</th>
                  <th className={th}>حالة المسير</th>
                  <th className={th}>الأساسي</th>
                  <th className={th}>أجر الدوام</th>
                  <th className={th}>الإجمالي</th>
                  <th className={th}>استرداد السلف</th>
                  <th className={th}>الصافي</th>
                </tr>
              </thead>
              <tbody>
                {(payslips.data?.data ?? []).map((slip) => (
                  <tr key={slip.id} className="border-b border-app-separator last:border-0">
                    <td className={`${td} font-mono`}>{slip.payroll_run?.period ?? "—"}</td>
                    <td className={td}>
                      {slip.payroll_run ? PAYROLL_STATUS_LABEL[slip.payroll_run.status] ?? slip.payroll_run.status : "—"}
                    </td>
                    <td className={`${td} font-mono`}>{money(slip.base_pay)}</td>
                    <td className={`${td} font-mono`}>{money(slip.attendance_pay)}</td>
                    <td className={`${td} font-mono`}>{money(slip.gross_pay)}</td>
                    <td className={`${td} font-mono`}>
                      {advanceRecovery(slip.deductions) > 0 ? money(advanceRecovery(slip.deductions)) : "—"}
                    </td>
                    <td className={`${td} font-mono font-bold`}>{money(slip.net_pay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payslips.isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
            {!payslips.isLoading && (payslips.data?.data ?? []).length === 0 && (
              <p className="p-4 text-xs text-app-label-secondary">لا توجد قسائم راتب.</p>
            )}
            <Pager page={payslipPage} lastPage={payslips.data?.last_page ?? 1} onChange={setPayslipPage} />
          </>
        )}
      </div>

      <EmployeeEditDialog
        employee={employee}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        canEditBank={holdsPayRole}
      />
    </div>
  );
};

export default EmployeeDetailPage;
