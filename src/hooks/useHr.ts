import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  hrApi,
  type Deduction,
  type AttendanceStatus,
  type LeaveType,
  type HrSettings,
  type WorkShiftPayload,
} from "../api/endpoints/hr";
import { apiErrorPayload } from "../api/endpoints/production";

export function useAttendance(params?: {
  work_date?: string;
  from?: string;
  to?: string;
  employee_id?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: async () => (await hrApi.getAttendance(params)).data,
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      work_date: string;
      entries: { employee_id: string; status: AttendanceStatus; hours_worked?: number; overtime_hours?: number; notes?: string }[];
    }) => hrApi.saveAttendance(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: AttendanceStatus; hours_worked?: number; overtime_hours?: number; notes?: string };
    }) =>
      hrApi.updateAttendance(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteAttendance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useLaborRates() {
  return useQuery({
    queryKey: ["laborRates"],
    queryFn: async () => (await hrApi.getRates()).data.data,
  });
}

export function useCreateLaborRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createRate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["laborRates"] }),
  });
}

export function usePayrollRuns(params?: { page?: number; period?: string; per_page?: number }) {
  return useQuery({
    queryKey: ["payrollRuns", params],
    queryFn: async () => (await hrApi.getPayrollRuns(params)).data,
  });
}

export function usePayslips(runId?: string) {
  return useQuery({
    queryKey: ["payslips", runId],
    queryFn: async () => (await hrApi.getPayslips(runId as string)).data.data,
    enabled: Boolean(runId),
  });
}

function usePayrollMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
      qc.invalidateQueries({ queryKey: ["payslips"] });
      qc.invalidateQueries({ queryKey: ["journalEntries"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
    // A refusal often means the run moved on the server (another user, or HR-11's
    // needs_recalculation flag): refetch so the page shows its real state and action.
    onError: () => {
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
      qc.invalidateQueries({ queryKey: ["payslips"] });
    },
  });
}

export function useOpenPayrollRun() {
  return usePayrollMutation((period: string) => hrApi.openPayrollRun(period));
}

export function usePayrollAction() {
  return usePayrollMutation(
    ({
      id,
      action,
      cashAccountId,
    }: {
      id: string;
      action: "calculate" | "submit" | "approve" | "mark-paid" | "post";
      cashAccountId?: string;
    }) => hrApi.payrollAction(id, action, cashAccountId ? { cash_account_id: cashAccountId } : undefined),
  );
}

export function useSetDeductions() {
  return usePayrollMutation(
    ({ payslipId, deductions }: { payslipId: string; deductions: Deduction[] }) =>
      hrApi.setDeductions(payslipId, deductions),
  );
}

export function useLeaveRequests(status?: string) {
  return useQuery({
    queryKey: ["leaveRequests", status],
    queryFn: async () => (await hrApi.getLeaveRequests(status ? { status } : undefined)).data,
  });
}

/**
 * One employee's leave requests that start in `year` (the employee card's leave tab).
 * Keyed under "leaveRequests" so creating or deciding a request refreshes it too.
 */
export function useEmployeeLeaveRequests(employeeId?: string, year?: number) {
  return useQuery({
    queryKey: ["leaveRequests", { employee_id: employeeId, year }],
    queryFn: async () =>
      (await hrApi.getLeaveRequests({ employee_id: employeeId, year, per_page: 200 })).data,
    enabled: Boolean(employeeId),
  });
}

export function useHrSettings() {
  return useQuery({
    queryKey: ["hrSettings"],
    queryFn: async () => (await hrApi.getHrSettings()).data,
  });
}

export function useUpdateHrSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<HrSettings>) => hrApi.updateHrSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hrSettings"] });
      // HR-14: changing the overtime settings flags calculated runs with overtime (needs_recalculation).
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
    },
  });
}

/** HR-14: the company's work shifts. */
export function useWorkShifts() {
  return useQuery({
    queryKey: ["workShifts"],
    queryFn: async () => (await hrApi.getWorkShifts()).data.data,
  });
}

/**
 * A shift change can flag calculated runs (needs_recalculation), so runs refetch too.
 * A 409 optimistic-lock conflict refetches the list, so a reopened edit form reads
 * the new record_version instead of conflicting again.
 */
function useWorkShiftMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workShifts"] });
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
    },
    onError: (err) => {
      if (apiErrorPayload(err)?.code === "OPTIMISTIC_LOCK_CONFLICT") {
        qc.invalidateQueries({ queryKey: ["workShifts"] });
      }
    },
  });
}

export function useCreateWorkShift() {
  return useWorkShiftMutation((payload: WorkShiftPayload) => hrApi.createWorkShift(payload));
}

export function useUpdateWorkShift() {
  return useWorkShiftMutation(
    ({ id, payload }: { id: string; payload: Partial<WorkShiftPayload> & { record_version: number } }) =>
      hrApi.updateWorkShift(id, payload),
  );
}

export function useDeleteWorkShift() {
  return useWorkShiftMutation((id: string) => hrApi.deleteWorkShift(id));
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      employee_id: string;
      start_date: string;
      end_date: string;
      leave_type: LeaveType;
      reason?: string;
    }) => hrApi.createLeaveRequest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useDecideLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, notes }: { id: string; decision: "approve" | "reject"; notes?: string }) =>
      hrApi.decideLeave(id, decision, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}
