import React, { useState } from "react";
import { CalendarOff, Plus, AlertTriangle, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLeaveRequests, useCreateLeaveRequest, useDecideLeave } from "../../hooks/useHr";
import { getEmployees } from "../../api/endpoints/employees";
import { apiErrorPayload } from "../../api/endpoints/production";
import { LEAVE_TYPE_LABEL, type LeaveType, type LeaveRequest } from "../../api/endpoints/hr";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

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

export const LeaveRequestsPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("annual");
  const [reason, setReason] = useState("");

  const { data: requests, isLoading } = useLeaveRequests();
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => getEmployees() });
  const createMutation = useCreateLeaveRequest();
  const decideMutation = useDecideLeave();

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        leave_type: leaveType,
        reason: reason || undefined,
      },
      {
        onSuccess: () => { setShowForm(false); setReason(""); },
        onError: (err) => fail(err, "تعذر إنشاء الطلب."),
      },
    );
  };

  const decide = (id: string, decision: "approve" | "reject") => {
    setError(null);
    decideMutation.mutate({ id, decision }, { onError: (err) => fail(err, "تعذر تسجيل القرار.") });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <CalendarOff className="w-7 h-7 text-app-accent" />
            طلبات الإجازة (Leave Requests)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كل طلب يمر على موافقة المدير، والقرار يُسجَّل باسم من اتخذه ولا يتغير.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> طلب إجازة
        </button>
      </div>

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {requests?.data.map((leave) => (
              <div key={leave.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="font-bold text-xs text-app-label-primary">
                  {leave.employee?.entity?.name ?? leave.employee_id.slice(0, 8)}
                </span>
                <span className="text-xs font-mono text-app-label-secondary">
                  {leave.start_date?.slice(0, 10)} ← {leave.end_date?.slice(0, 10)}
                </span>
                <span className="text-xs text-app-label-secondary">{LEAVE_TYPE_LABEL[leave.leave_type]}</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLE[leave.status]}`}>
                  {STATUS_LABEL[leave.status]}
                </span>
                {leave.reason && <span className="text-[10px] text-app-label-tertiary">{leave.reason}</span>}
                {leave.decided_by && (
                  <span className="text-[10px] text-app-label-tertiary">قرار: {leave.decided_by.name}</span>
                )}

                {leave.status === "pending" && (
                  <div className="ms-auto flex gap-2">
                    <button
                      onClick={() => decide(leave.id, "approve")}
                      disabled={decideMutation.isPending}
                      className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> موافقة
                    </button>
                    <button
                      onClick={() => decide(leave.id, "reject")}
                      disabled={decideMutation.isPending}
                      className="flex items-center gap-1 rounded-xl border border-app-status-danger/40 px-3 py-1.5 text-xs font-bold text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> رفض
                    </button>
                  </div>
                )}
              </div>
            ))}
            {requests?.data.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">لا توجد طلبات.</div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">طلب إجازة</h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              <SearchableSelect<{ id: string; entity?: { name?: string }; job_title?: string }>
                options={employees ?? []}
                value={
                  employees?.find((e) => e.id === employeeId) ?? null
                }
                onChange={(e) => setEmployeeId(e ? e.id : "")}
                getOptionId={(e) => e.id}
                getOptionLabel={(e) => e.entity?.name ?? e.job_title ?? e.id}
                getOptionSubLabel={(e) => e.job_title}
                getOptionSearchText={(e) =>
                  `${e.entity?.name ?? ""} ${e.job_title ?? ""}`
                }
                placeholder="الموظف…"
                required
              />
              <div className="flex gap-2">
                <input
                  type="date" required value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                />
                <input
                  type="date" required value={endDate} min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                />
              </div>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              >
                {(Object.keys(LEAVE_TYPE_LABEL) as LeaveType[]).map((t) => (
                  <option key={t} value={t}>{LEAVE_TYPE_LABEL[t]}</option>
                ))}
              </select>
              <input
                type="text" placeholder="السبب (اختياري)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !employeeId || !startDate || !endDate}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? "جارٍ الإرسال…" : "إرسال الطلب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
