import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useEmployeeLeaveRequests, useHrSettings, useUpdateHrSettings } from "../../hooks/useHr";
import { LEAVE_TYPE_LABEL, type LeaveRequest } from "../../api/endpoints/hr";
import { employeeErrorMessage } from "../../api/endpoints/employees";
import { formatDate, formatInteger } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";

const STATUS_STYLE: Record<LeaveRequest["status"], string> = {
  pending: "bg-app-status-yellow/15 text-app-status-yellow",
  approved: "bg-app-status-positive/10 text-app-status-positive",
  rejected: "bg-app-status-danger/10 text-app-status-danger",
};

const STATUS_LABEL: Record<LeaveRequest["status"], string> = {
  pending: "قيد النظر",
  approved: "موافَق عليها",
  rejected: "مرفوضة",
};

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";

/** Calendar days from start to end, both included. Dates may carry a time part. */
const leaveDays = (start: string, end: string): number => {
  const [sy, sm, sd] = start.slice(0, 10).split("-").map(Number);
  const [ey, em, ed] = end.slice(0, 10).split("-").map(Number);
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86_400_000) + 1;
};

interface Props {
  employeeId: string;
  /** Owner or hr-manager (HR-10): may change the company's annual leave entitlement. */
  canEditEntitlement: boolean;
}

/** The employee's leave requests for a year, with the annual-leave balance against the company entitlement. */
export const EmployeeLeaveTab: React.FC<Props> = ({ employeeId, canEditEntitlement }) => {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const { data, isLoading, isError } = useEmployeeLeaveRequests(employeeId, year);
  const { data: settings } = useHrSettings();
  const updateSettings = useUpdateHrSettings();
  const [editingEntitlement, setEditingEntitlement] = useState(false);
  const [entitlementDraft, setEntitlementDraft] = useState("");

  const requests = useMemo(() => data?.data ?? [], [data]);
  const entitlement = settings?.annual_leave_days ?? 30;

  // Leave counted in a year is leave that starts in it (the API's year filter).
  const { used, pending } = useMemo(() => {
    let usedDays = 0;
    let pendingDays = 0;
    for (const r of requests) {
      if (r.leave_type !== "annual") continue;
      if (r.status === "approved") usedDays += leaveDays(r.start_date, r.end_date);
      else if (r.status === "pending") pendingDays += leaveDays(r.start_date, r.end_date);
    }
    return { used: usedDays, pending: pendingDays };
  }, [requests]);
  const remaining = entitlement - used;

  const saveEntitlement = () => {
    const value = Number(entitlementDraft);
    if (!Number.isInteger(value) || value < 0 || value > 366) {
      toast.error("أدخل عدد أيام صحيحاً بين 0 و366.");
      return;
    }
    updateSettings.mutate(
      { annual_leave_days: value },
      {
        onSuccess: () => {
          toast.success("تم تحديث رصيد الإجازة السنوية");
          setEditingEntitlement(false);
        },
        onError: (err) => toast.error(employeeErrorMessage(err, "تعذر تحديث رصيد الإجازة.")),
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-separator p-3">
        <div className="flex items-center gap-2 text-xs">
          <label className="font-semibold text-app-label-secondary">السنة</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 font-mono text-app-label-primary focus:outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => thisYear + 1 - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-app-label-secondary">الإجازة السنوية المستخدمة: </span>
            <span className="font-mono font-bold text-app-label-primary">
              {formatInteger(used)} / {formatInteger(entitlement)}
            </span>
            <span className="text-app-label-secondary"> يوم</span>
          </div>
          <div>
            <span className="text-app-label-secondary">المتبقي: </span>
            <span className={`font-mono font-bold ${remaining < 0 ? "text-app-status-danger" : "text-app-status-positive"}`}>
              {formatInteger(remaining)}
            </span>
          </div>
          {pending > 0 && (
            <div>
              <span className="text-app-label-secondary">قيد النظر: </span>
              <span className="font-mono font-bold text-app-status-yellow">{formatInteger(pending)}</span>
            </div>
          )}
          {canEditEntitlement &&
            (editingEntitlement ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="366"
                  step="1"
                  value={entitlementDraft}
                  onChange={(e) => setEntitlementDraft(e.target.value)}
                  className="w-20 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 font-mono text-app-label-primary focus:outline-none"
                  aria-label="أيام الإجازة السنوية للشركة"
                />
                <button
                  onClick={saveEntitlement}
                  disabled={updateSettings.isPending}
                  className="rounded-lg bg-app-accent px-2.5 py-1 font-bold text-white disabled:opacity-50"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setEditingEntitlement(false)}
                  className="rounded-lg px-2 py-1 text-app-label-secondary hover:bg-app-fill-f1"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEntitlementDraft(String(entitlement));
                  setEditingEntitlement(true);
                }}
                className="inline-flex items-center gap-1 text-app-accent hover:underline"
                title="رصيد الإجازة السنوية إعداد عام للشركة"
              >
                <Pencil className="h-3 w-3" />
                تعديل الرصيد السنوي
              </button>
            ))}
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-app-bg-secondary border-b border-app-separator">
          <tr>
            <th className={th}>النوع</th>
            <th className={th}>من</th>
            <th className={th}>إلى</th>
            <th className={th}>الأيام</th>
            <th className={th}>الحالة</th>
            <th className={th}>السبب</th>
            <th className={th}>القرار</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-app-separator last:border-0">
              <td className={td}>{LEAVE_TYPE_LABEL[r.leave_type] ?? r.leave_type}</td>
              <td className={`${td} font-mono`}>{formatDate(r.start_date)}</td>
              <td className={`${td} font-mono`}>{formatDate(r.end_date)}</td>
              <td className={`${td} font-mono`}>{formatInteger(leaveDays(r.start_date, r.end_date))}</td>
              <td className={td}>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status]}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </td>
              <td className={td}>{r.reason || "—"}</td>
              <td className={td}>
                {r.decided_by?.name ?? "—"}
                {r.decision_notes && <div className="text-[10px] text-app-label-tertiary">{r.decision_notes}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
      {isError && <p className="p-4 text-xs text-app-status-danger">تعذر تحميل طلبات الإجازة.</p>}
      {!isLoading && !isError && requests.length === 0 && (
        <p className="p-4 text-xs text-app-label-secondary">لا توجد طلبات إجازة في {year}.</p>
      )}
    </>
  );
};

export default EmployeeLeaveTab;
