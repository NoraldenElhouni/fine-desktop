import apiClient from "../client";
import type { Paginated } from "./accounting";
import { apiErrorMessage, apiErrorPayload } from "./production";

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
  /** HR-14: overtime on top of the hours worked (hours + overtime ≤ 24; only on a present or half day). */
  overtime_hours?: string | null;
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
  /**
   * HR-12: payroll's own advance-recovery lines are locked — calculated from the
   * advance schedule and kept by the server whatever the editor sends.
   */
  locked?: boolean;
  installment_id?: string | null;
  employee_advance_id?: string;
  /** The installment's period (YYYY-MM); earlier than the run when a shortfall carried forward. */
  period?: string;
  /** HR-13: a standing pay item's or an approved one-off adjustment's line (locked too). */
  source?: PayLineSource;
  pay_item_id?: string;
  adjustment_id?: string;
  /** HR-13: liability credits 225, expense_reduction credits 57 (set by the server). */
  account_role?: "liability" | "expense_reduction";
  reason?: string;
}

/** HR-13: where payroll took an addition or a locked deduction line from. */
export type PayLineSource = "pay_item" | "adjustment";

/** HR-13: an allowance or bonus payroll added to gross pay (`type` is an allowance-types code). */
export interface PayslipAddition {
  type: string;
  source: PayLineSource;
  pay_item_id?: string;
  adjustment_id?: string;
  /** Standing items: fixed per period or a percentage of base + attendance pay. */
  calc?: "fixed" | "percent_of_base";
  value?: number;
  /** One-off adjustments: why it was granted. */
  reason?: string;
  amount: number;
}

/** HR-12: the deduction line type payroll gives an advance installment. */
export const ADVANCE_DEDUCTION_TYPE = "advance";

/** An advance or loan installment payroll deducted (credits 1215, not 225). */
export const isAdvanceDeduction = (d: Deduction): boolean =>
  d.type === ADVANCE_DEDUCTION_TYPE && Boolean(d.installment_id);

/** A line the deductions editor may not touch (the server keeps it as calculated). */
export const isLockedDeduction = (d: Deduction): boolean => d.locked === true || Boolean(d.installment_id);

/** The advance recovery on a payslip. */
export const advanceRecovery = (deductions: Deduction[] | null | undefined): number =>
  (deductions ?? []).filter(isAdvanceDeduction).reduce((sum, d) => sum + Number(d.amount || 0), 0);

export interface Payslip {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  operating_unit_id: string;
  base_pay: string;
  attendance_pay: string;
  /** HR-14: overtime pay, inside gross (gross = base + attendance + overtime + additions). */
  overtime_pay?: string | null;
  labor_log_pay: string;
  /** HR-13: standing allowances and approved bonuses; gross = base + attendance + additions. */
  additions?: PayslipAddition[] | null;
  additions_pay?: string | null;
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
  /** HR-11: pay terms changed after it was calculated; submit is refused until it is recalculated. */
  needs_recalculation?: boolean;
}

/** Company-wide HR settings (GET/PUT /hr-settings). */
export interface HrSettings {
  /** The annual leave entitlement the employee card's balance is measured against (default 30). */
  annual_leave_days: number;
  /** HR-12: one advance is at most this multiple of the monthly base salary (default 1). */
  advance_max_salary_multiple?: number;
  /** HR-12: the monthly recovery is at most this percentage of the salary (default 50). */
  advance_max_deduction_pct?: number;
  /** HR-14: the monthly hours a salary is divided by for the overtime hourly base (default 208). */
  monthly_standard_hours?: number;
  /** HR-14: the overtime multiplier of an employee without a shift (default 1.5). */
  overtime_multiplier?: number;
}

/** HR-14: a company-wide work shift (GET/POST /work-shifts, PUT/DELETE /work-shifts/{id}). */
export interface WorkShift {
  id: string;
  name: string;
  /** The day's standard hours: a daily-paid employee's overtime hourly base is daily rate / these. */
  standard_hours: number;
  /** Applies to the overtime of every employee on the shift. */
  overtime_multiplier: number;
  /** HH:MM, or null. */
  start_time: string | null;
  end_time: string | null;
  record_version: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkShiftPayload {
  name: string;
  standard_hours: number;
  overtime_multiplier?: number;
  start_time?: string | null;
  end_time?: string | null;
}

/** Overtime is recorded only on a day at work (AttendanceStatus::isPayable). */
export const isPayableAttendance = (status: AttendanceStatus): boolean =>
  status === "present" || status === "half_day";

/**
 * Mirrors AttendanceController::assertDayHours (whose 422 messages are English):
 * hours worked and overtime together fit in one day, and overtime only on a day at work.
 */
export const attendanceDayError = (status: AttendanceStatus, hours: number, overtime: number): string | null => {
  if (overtime > 0 && !isPayableAttendance(status)) {
    return "الساعات الإضافية تُسجَّل فقط ليوم حضور أو نصف يوم.";
  }
  if (Math.round((hours + overtime) * 100) / 100 > 24) {
    return "مجموع ساعات العمل والساعات الإضافية لا يتجاوز 24 ساعة في اليوم.";
  }
  return null;
};

/**
 * The attendance overtime refusals carry no code, only an English validation message
 * under `overtime_hours` (or `entries.N.overtime_hours` for the daily sheet).
 */
export const attendanceErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err);
  const overtimeError = Object.entries(payload?.errors ?? {}).find(([field]) => field.endsWith("overtime_hours"))?.[1]?.[0];
  if (overtimeError) {
    if (/cannot exceed 24 hours/.test(overtimeError)) {
      return "مجموع ساعات العمل والساعات الإضافية لا يتجاوز 24 ساعة في اليوم.";
    }
    if (/only be recorded on a day/.test(overtimeError)) {
      return "الساعات الإضافية تُسجَّل فقط ليوم حضور أو نصف يوم — اجعلها 0 قبل تحويل اليوم إلى غياب أو إجازة.";
    }
    return "الساعات الإضافية بين 0 و24 ساعة.";
  }
  return apiErrorMessage(err, fallback);
};

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
    entries: { employee_id: string; status: AttendanceStatus; hours_worked?: number; overtime_hours?: number; notes?: string }[];
  }) => apiClient.post<{ message: string; count: number }>("/attendance/bulk", payload),

  createAttendance: (payload: {
    employee_id: string;
    work_date: string;
    status: AttendanceStatus;
    hours_worked?: number;
    overtime_hours?: number;
    notes?: string;
  }) => apiClient.post<Attendance>("/attendance", payload),

  updateAttendance: (
    id: string,
    payload: {
      status?: AttendanceStatus;
      hours_worked?: number;
      overtime_hours?: number;
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

  /** `post` needs the treasury net pay leaves from (`cash_account_id`). */
  payrollAction: (
    id: string,
    action: "calculate" | "submit" | "approve" | "mark-paid" | "post",
    body?: { cash_account_id: string },
  ) => apiClient.post<PayrollRun>(`/payroll-runs/${id}/${action}`, body),

  getPayslips: (runId: string) =>
    apiClient.get<{ data: Payslip[] }>(`/payroll-runs/${runId}/payslips`),

  setDeductions: (payslipId: string, deductions: Deduction[]) =>
    apiClient.put<Payslip>(`/payslips/${payslipId}/deductions`, { deductions }),

  getLeaveRequests: (params?: {
    status?: string;
    employee_id?: string;
    leave_type?: LeaveType;
    /** Leave counted in a year is leave that starts in it. */
    year?: number;
    page?: number;
    per_page?: number;
  }) =>
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

  getHrSettings: () => apiClient.get<HrSettings>("/hr-settings"),

  /** Send only the settings being changed. */
  updateHrSettings: (payload: Partial<HrSettings>) => apiClient.put<HrSettings>("/hr-settings", payload),

  getWorkShifts: () => apiClient.get<{ data: WorkShift[] }>("/work-shifts"),

  createWorkShift: (payload: WorkShiftPayload) => apiClient.post<{ data: WorkShift }>("/work-shifts", payload),

  updateWorkShift: (id: string, payload: Partial<WorkShiftPayload> & { record_version: number }) =>
    apiClient.put<{ data: WorkShift }>(`/work-shifts/${id}`, payload),

  deleteWorkShift: (id: string) => apiClient.delete<{ message: string }>(`/work-shifts/${id}`),
};
