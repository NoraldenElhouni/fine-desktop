import React, { useEffect, useState } from "react";
import { CalendarCheck2, AlertTriangle, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAttendance, useSaveAttendance } from "../../hooks/useHr";
import { getEmployees } from "../../api/endpoints/employees";
import { apiErrorPayload } from "../../api/endpoints/production";
import { ATTENDANCE_STATUS_LABEL, type AttendanceStatus } from "../../api/endpoints/hr";

interface RowState {
  status: AttendanceStatus;
  hours: string;
}

const DEFAULT_ROW: RowState = { status: "present", hours: "8" };

export const AttendancePage: React.FC = () => {
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => getEmployees() });
  const { data: attendance, isLoading } = useAttendance({ work_date: workDate });
  const saveMutation = useSaveAttendance();

  // Seed the grid from what is already recorded for the day.
  useEffect(() => {
    if (!attendance) return;
    const seeded: Record<string, RowState> = {};
    for (const record of attendance.data) {
      seeded[record.employee_id] = {
        status: record.status,
        hours: String(Number(record.hours_worked)),
      };
    }
    setRows(seeded);
    setSaved(false);
  }, [attendance]);

  const rowFor = (employeeId: string): RowState => rows[employeeId] ?? DEFAULT_ROW;

  const patch = (employeeId: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [employeeId]: { ...rowFor(employeeId), ...patch } }));

  const save = () => {
    setError(null);
    setSaved(false);
    saveMutation.mutate(
      {
        work_date: workDate,
        entries: (employees ?? []).map((e) => ({
          employee_id: e.id,
          status: rowFor(e.id).status,
          hours_worked: rowFor(e.id).status === "present" || rowFor(e.id).status === "half_day"
            ? Number(rowFor(e.id).hours) || 0
            : 0,
        })),
      },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذر حفظ الحضور."),
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-app-accent" />
            الحضور والانصراف (Attendance)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كشف يومي واحد لكل الموظفين. إعادة الحفظ تصحّح اليوم نفسه، وساعات الحضور تدخل مباشرة في حساب الرواتب.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date" value={workDate} max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => { setWorkDate(e.target.value); setRows({}); }}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono text-app-label-primary focus:border-app-accent focus:outline-none"
          />
          <button
            onClick={save}
            disabled={saveMutation.isPending || !employees?.length}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saveMutation.isPending ? "جارٍ الحفظ…" : "حفظ الكشف"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="rounded-2xl border border-app-status-positive/30 bg-app-status-positive/10 p-4 text-xs font-bold text-app-status-positive">
          حُفظ كشف {workDate}.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-app-label-secondary border-b border-app-separator bg-app-bg-secondary">
              <tr>
                <th className="px-4 py-2.5 text-start font-bold">الموظف</th>
                <th className="px-4 py-2.5 text-start font-bold">الوظيفة</th>
                <th className="px-4 py-2.5 text-start font-bold">الحالة</th>
                <th className="px-4 py-2.5 text-start font-bold">الساعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {employees?.map((employee) => {
                const row = rowFor(employee.id);
                const payable = row.status === "present" || row.status === "half_day";

                return (
                  <tr key={employee.id} className="hover:bg-app-fill-f1">
                    <td className="px-4 py-2 font-bold text-app-label-primary">
                      {employee.entity?.name ?? employee.job_title}
                    </td>
                    <td className="px-4 py-2 text-app-label-secondary">{employee.job_title}</td>
                    <td className="px-4 py-2">
                      <select
                        value={row.status}
                        onChange={(e) => patch(employee.id, { status: e.target.value as AttendanceStatus })}
                        className="rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs focus:border-app-accent focus:outline-none"
                      >
                        {(Object.keys(ATTENDANCE_STATUS_LABEL) as AttendanceStatus[]).map((s) => (
                          <option key={s} value={s}>{ATTENDANCE_STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number" step="0.5" min="0" max="24"
                        value={payable ? row.hours : "0"}
                        disabled={!payable}
                        onChange={(e) => patch(employee.id, { hours: e.target.value })}
                        className="w-20 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs font-mono focus:border-app-accent focus:outline-none disabled:opacity-40"
                      />
                    </td>
                  </tr>
                );
              })}
              {!employees?.length && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-app-label-tertiary">لا يوجد موظفون مسجلون.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
