import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrApi, type Deduction, type AttendanceStatus, type LeaveType } from "../api/endpoints/hr";

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
      entries: { employee_id: string; status: AttendanceStatus; hours_worked?: number; notes?: string }[];
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
    mutationFn: ({ id, payload }: { id: string; payload: { status?: AttendanceStatus; hours_worked?: number; notes?: string } }) =>
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
  });
}

export function useOpenPayrollRun() {
  return usePayrollMutation((period: string) => hrApi.openPayrollRun(period));
}

export function usePayrollAction() {
  return usePayrollMutation(
    ({ id, action }: { id: string; action: "calculate" | "submit" | "approve" | "mark-paid" | "post" }) =>
      hrApi.payrollAction(id, action),
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
