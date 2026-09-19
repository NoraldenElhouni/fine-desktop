import apiClient from "../client";
import type { Paginated } from "./accounting";

export type AttendanceStatus = "present" | "absent" | "leave" | "half_day";
export type PayrollRunStatus =
  | "draft"
  | "calculated"
  | "pending_approval"
  | "approved"
  | "paid"
  | "posted";
export type LeaveType = "annual" | "sick" | "unpaid" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  leave: "إجازة",
  half_day: "نصف يوم",
};

export const PAYROLL_STATUS_LABEL: Record<PayrollRunStatus, string> = {
  draft: "مسودة",
  calculated: "محسوب",
  pending_approval: "بانتظار الاعتماد",
  approved: "معتمد",
  paid: "مدفوع",
  posted: "مُرحَّل",
};

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  annual: "سنوية",
  sick: "مرضية",
  unpaid: "بدون راتب",
  other: "أخرى",
};

export interface EmployeeRef {
  id: string;
  job_title?: string;
  labor_role?: string | null;
  pay_type?: string;
  entity?: { id: string; name: string };
}

export interface Attendance {
  id: string;
  employee_id: string;
  work_date: string;
  status: AttendanceStatus;
  hours_worked: string;
  notes: string | null;
  employee?: EmployeeRef;
}

export interface LaborRoleRate {
  id: string;
  role: string;
  hourly_rate: string;
  effective_from: string;
}

export interface Deduction {
  type: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  operating_unit_id: string;
  base_pay: string;
  attendance_pay: string;
  labor_log_pay: string;
  gross_pay: string;
  deductions: Deduction[] | null;
  net_pay: string;
  journal_entry_id: string | null;
  employee?: EmployeeRef;
  operating_unit?: { id: string; name: string };
}

export interface PayrollRun {
  id: string;
  period: string;
  status: PayrollRunStatus;
  total_gross: string;
  total_deductions: string;
  total_net: string;
  payslips_count?: number;
  payslips?: Payslip[];
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string | null;
  status: LeaveStatus;
  decision_notes: string | null;
  employee?: EmployeeRef;
  decided_by?: { id: string; name: string } | null;
}

export const hrApi = {
  getAttendance: (params?: {
    work_date?: string;
    from?: string;
    to?: string;
    employee_id?: string;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => apiClient.get<Paginated<Attendance>>("/attendance", { params }),

  saveAttendance: (payload: {
    work_date: string;
    entries: { employee_id: string; status: AttendanceStatus; hours_worked?: number; notes?: string }[];
  }) => apiClient.post<{ message: string; count: number }>("/attendance/bulk", payload),

  createAttendance: (payload: {
    employee_id: string;
    work_date: string;
    status: AttendanceStatus;
    hours_worked?: number;
    notes?: string;
  }) => apiClient.post<Attendance>("/attendance", payload),

  updateAttendance: (
    id: string,
    payload: {
      status?: AttendanceStatus;
      hours_worked?: number;
      notes?: string;
    },
  ) => apiClient.put<Attendance>(`/attendance/${id}`, payload),

  deleteAttendance: (id: string) => apiClient.delete(`/attendance/${id}`),

  getRates: () => apiClient.get<{ data: LaborRoleRate[] }>("/labor-role-rates"),

  getCurrentRates: () => apiClient.get<{ data: LaborRoleRate[] }>("/labor-role-rates/current"),

  createRate: (payload: { role: string; hourly_rate: number; effective_from: string }) =>
    apiClient.post<LaborRoleRate>("/labor-role-rates", payload),

  getPayrollRuns: (params?: { page?: number; period?: string; per_page?: number }) =>
    apiClient.get<Paginated<PayrollRun>>("/payroll-runs", { params }),

  openPayrollRun: (period: string) => apiClient.post<PayrollRun>("/payroll-runs", { period }),

  payrollAction: (id: string, action: "calculate" | "submit" | "approve" | "mark-paid" | "post") =>
    apiClient.post<PayrollRun>(`/payroll-runs/${id}/${action}`),

  getPayslips: (runId: string) =>
    apiClient.get<{ data: Payslip[] }>(`/payroll-runs/${runId}/payslips`),

  setDeductions: (payslipId: string, deductions: Deduction[]) =>
    apiClient.put<Payslip>(`/payslips/${payslipId}/deductions`, { deductions }),

  getLeaveRequests: (params?: { status?: string; page?: number }) =>
    apiClient.get<Paginated<LeaveRequest>>("/leave-requests", { params }),

  createLeaveRequest: (payload: {
    employee_id: string;
    start_date: string;
    end_date: string;
    leave_type: LeaveType;
    reason?: string;
  }) => apiClient.post<LeaveRequest>("/leave-requests", payload),

  decideLeave: (id: string, decision: "approve" | "reject", notes?: string) =>
    apiClient.put<LeaveRequest>(`/leave-requests/${id}/${decision}`, { notes }),
};
