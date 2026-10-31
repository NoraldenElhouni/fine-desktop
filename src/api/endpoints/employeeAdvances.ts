import apiClient from "../client";
import { LEDGER_ERROR_MESSAGE, apiErrorPayload } from "./production";
import { formatNumber } from "../../lib/utils/format";

/**
 * W5-02 (decision #14, HR-12): salary advances and loans. HR (manage-hr) requests
 * and cancels a request; an approve-advances holder (owner, accounting manager,
 * HR manager) approves, pays out from a treasury (DR 1215 employee / CR treasury)
 * and records cash repayments. Payroll recovers the schedule in installments.
 */

export type EmployeeAdvanceType = "advance" | "loan";
export type EmployeeAdvanceStatus = "requested" | "approved" | "paid" | "settled" | "cancelled";
export type AdvanceInstallmentStatus = "pending" | "recovered" | "cancelled";

export const ADVANCE_TYPE_LABEL: Record<EmployeeAdvanceType, string> = {
  advance: "سلفة",
  loan: "قرض",
};

export const ADVANCE_STATUS_LABEL: Record<EmployeeAdvanceStatus, string> = {
  requested: "مطلوبة",
  approved: "معتمدة",
  paid: "مصروفة",
  settled: "مسددة",
  cancelled: "ملغاة",
};

export const INSTALLMENT_STATUS_LABEL: Record<AdvanceInstallmentStatus, string> = {
  pending: "مستحق",
  recovered: "محصّل",
  cancelled: "ملغى",
};

export const ADVANCE_ENTRY_KIND_LABEL: Record<AdvanceEntry["kind"], string> = {
  payout: "صرف",
  repayment: "سداد نقدي",
  reversal: "قيد عكسي",
};

/** One month of the recovery schedule. */
export interface AdvanceInstallment {
  id: string;
  /** YYYY-MM */
  period: string;
  amount: number;
  recovered_amount: number;
  remaining: number;
  payslip_id: string | null;
  status: AdvanceInstallmentStatus;
  status_label?: string;
}

/** The payout and every cash repayment posted against the advance (show only). */
export interface AdvanceEntry {
  id: string;
  reference: string;
  entry_date: string | null;
  kind: "payout" | "repayment" | "reversal";
  amount: number;
}

export interface EmployeeAdvance {
  id: string;
  employee_id: string;
  employee: {
    id: string;
    name: string | null;
    employee_number: string | null;
    deleted_at: string | null;
  } | null;
  operating_unit_id: string;
  type: EmployeeAdvanceType;
  type_label?: string;
  amount: number;
  installments: number;
  monthly_amount: number;
  /** YYYY-MM: the first month payroll recovers. */
  start_period: string;
  status: EmployeeAdvanceStatus;
  status_label?: string;
  notes: string | null;
  cash_account_id: string | null;
  cash_account: { id: string; name: string } | null;
  payout_entry_id: string | null;
  payout_entry: { id: string; reference: string } | null;
  requested_by: { id: string; name: string } | null;
  approved_by: { id: string; name: string } | null;
  approved_at: string | null;
  paid_at: string | null;
  settled_at: string | null;
  cancelled_at: string | null;
  recovered: number | null;
  outstanding: number | null;
  schedule: AdvanceInstallment[] | null;
  entries?: AdvanceEntry[];
  /** The payout entry was reversed in the ledger while the advance is still open. */
  payout_reversed?: boolean;
  record_version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeAdvancePage {
  data: EmployeeAdvance[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface EmployeeAdvanceFilters {
  employee_id?: string;
  status?: EmployeeAdvanceStatus;
  type?: EmployeeAdvanceType;
  page?: number;
  per_page?: number;
}

export interface CreateEmployeeAdvancePayload {
  employee_id: string;
  type: EmployeeAdvanceType;
  amount: number;
  installments: number;
  /** YYYY-MM, this month or later. */
  start_period: string;
  notes?: string;
}

export const employeeAdvancesApi = {
  list: async (filters?: EmployeeAdvanceFilters): Promise<EmployeeAdvancePage> =>
    (await apiClient.get<EmployeeAdvancePage>("/employee-advances", { params: filters })).data,

  get: async (id: string): Promise<EmployeeAdvance> =>
    (await apiClient.get<{ data: EmployeeAdvance }>(`/employee-advances/${id}`)).data.data,

  create: async (payload: CreateEmployeeAdvancePayload): Promise<EmployeeAdvance> =>
    (await apiClient.post<{ data: EmployeeAdvance }>("/employee-advances", payload)).data.data,

  approve: async (id: string): Promise<EmployeeAdvance> =>
    (await apiClient.post<{ data: EmployeeAdvance }>(`/employee-advances/${id}/approve`)).data.data,

  /** Payout from a LYD treasury: DR 1215 (employee) / CR treasury. */
  pay: async (id: string, cashAccountId: string): Promise<EmployeeAdvance> =>
    (await apiClient.post<{ data: EmployeeAdvance }>(`/employee-advances/${id}/pay`, { cash_account_id: cashAccountId }))
      .data.data,

  /** Cash repayment into a LYD treasury: DR treasury / CR 1215; shortens the schedule from its end. */
  repay: async (id: string, amount: number, cashAccountId: string): Promise<EmployeeAdvance> =>
    (
      await apiClient.post<{ data: EmployeeAdvance }>(`/employee-advances/${id}/repay`, {
        amount,
        cash_account_id: cashAccountId,
      })
    ).data.data,

  /** Before payout only; cancelling an approved advance needs an approver. */
  cancel: async (id: string): Promise<EmployeeAdvance> =>
    (await apiClient.post<{ data: EmployeeAdvance }>(`/employee-advances/${id}/cancel`)).data.data,
};

/** The roles the approve / pay / repay routes accept (with the approve-advances permission). */
export const ADVANCE_APPROVER_ROLES = ["owner", "accounting-manager", "hr-manager"];

/** Mirrors EmployeeAdvanceService::request(): floored to the dirham, the last installment absorbs the rest. */
export const monthlyInstallment = (amount: number, installments: number): number =>
  installments >= 1 ? Math.floor((amount / installments) * 1000) / 1000 : 0;

/** Codes whose generic name is shared with other modules, in their advance meaning. */
const ADVANCE_ONLY_MESSAGE: Record<string, string> = {
  INVALID_INSTALLMENTS: "عدد الأقساط غير صالح، أو المبلغ صغير جداً على هذا العدد من الأقساط.",
  INVALID_STATE_TRANSITION: "تغيّرت حالة السلفة ولم يعد هذا الإجراء متاحاً — حدّث الصفحة.",
  INVALID_AMOUNT: "المبلغ يجب أن يكون أكبر من صفر.",
};

/**
 * Advance money as the server keeps it: amounts, recoveries and limits are
 * stored to 4 decimals (monthly installments floor to the dirham, the last one
 * absorbs the rest) and repayments are checked with a 0.0001 tolerance, so a
 * 2-decimal display would show a figure the server then refuses.
 */
export const formatAdvanceMoney = (v: number | string | null | undefined): string =>
  formatNumber(v, { maximumFractionDigits: 4 });

/** Arabic text for an advance refusal, with the limit or balance the server sent. */
export const advanceErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err);
  const code = payload?.code;
  const base =
    (code && (ADVANCE_ONLY_MESSAGE[code] ?? LEDGER_ERROR_MESSAGE[code])) ||
    (payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined) ||
    payload?.message ||
    fallback;

  if (code === "ADVANCE_LIMIT_EXCEEDED" && payload?.max_amount != null) {
    return `${base} الحد الأقصى: ${formatAdvanceMoney(payload.max_amount)} د.ل${
      payload.monthly_salary != null ? ` (الراتب الشهري ${formatAdvanceMoney(payload.monthly_salary)} د.ل)` : ""
    }.`;
  }
  if (code === "ADVANCE_DEDUCTION_LIMIT" && payload?.max_monthly != null) {
    return `${base} الحد الشهري: ${formatAdvanceMoney(payload.max_monthly)} د.ل، تأخذ منه السلف المفتوحة الأخرى ${formatAdvanceMoney(
      payload.open_monthly ?? 0,
    )} د.ل.`;
  }
  if (code === "ADVANCE_REPAYMENT_EXCEEDS" && payload?.available != null) {
    return `${base} المتاح للسداد: ${formatAdvanceMoney(payload.available)} د.ل.`;
  }
  return base;
};
