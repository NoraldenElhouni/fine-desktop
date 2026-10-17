import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CalendarCheck, Receipt, UserCircle } from "lucide-react";
import { useEmployee, useEmployeeAttendance, useEmployeePayslips } from "../../hooks/useEmployees";
import { ATTENDANCE_STATUS_LABEL, PAYROLL_STATUS_LABEL } from "../../api/endpoints/hr";
import { formatDate } from "../../lib/utils/format";
import type { EmployeeStatus, PayType } from "../../types/entities";

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: "على رأس العمل",
  on_leave: "في إجازة",
  terminated: "منتهية خدمته",
};

const PAY_TYPE_LABEL: Record<PayType, string> = {
  monthly: "راتب شهري",
  hourly: "بالساعة",
  piece_rate: "بالقطعة",
};

const money = (v: string | number | null | undefined) => Number(v ?? 0).toLocaleString();

type Tab = "attendance" | "payslips";

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

/** One employee: master data plus their attendance and payslip history. */
export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("attendance");
  const [attendancePage, setAttendancePage] = useState(1);
  const [payslipPage, setPayslipPage] = useState(1);

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
            {employee.job_title}
            {employee.operating_unit?.name ? ` · ${employee.operating_unit.name}` : ""}
          </p>
        </div>
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

      <div className="flex gap-2">
        {([
          ["attendance", "الدوام", CalendarCheck],
          ["payslips", "قسائم الراتب", Receipt],
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
        {tab === "attendance" ? (
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
    </div>
  );
};

export default EmployeeDetailPage;
