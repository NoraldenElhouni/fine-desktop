import apiClient from "../client";

/*
 * W5-08 (decision #6): optional installment schedules on a registered
 * client's receivable (آجل) sale. A plan splits what the client still owes,
 * after an optional down payment, into equal monthly installments; the last
 * one absorbs the rounding. The schedule moves no money: collections keep
 * going through the sale's own payments, and each installment's paid amount
 * and status are derived by the backend, oldest due first.
 */

type Money = number | string;

/** InstallmentPlanService::MAX_INSTALLMENTS. */
export const MAX_INSTALLMENTS = 60;

/** Who may read GET /installments (owner and admin always pass). */
export const INSTALLMENT_ROLES = [
  "owner",
  "admin",
  "store-manager",
  "pos-cashier",
  "cutter-manager",
  "unit_manager",
  "manager",
  "accounting-manager",
  "treasury-officer",
];

/** GET /installments needs either of these view permissions. */
export const INSTALLMENT_PERMISSION = "view-sales|view-debtor-statements";

export type InstallmentLineStatus = "upcoming" | "partial" | "overdue" | "paid" | "cancelled";

/** Fallback when a row comes without the backend's Arabic status_label. */
export const INSTALLMENT_STATUS_LABEL: Record<InstallmentLineStatus, string> = {
  upcoming: "قادم",
  partial: "مدفوع جزئياً",
  overdue: "متأخر",
  paid: "مدفوع",
  cancelled: "ملغى بالمرتجع",
};

export const INSTALLMENT_STATUS_CHIP: Record<InstallmentLineStatus, string> = {
  upcoming: "bg-app-fill-f1 text-app-label-secondary",
  partial: "bg-app-accent/15 text-app-accent",
  overdue: "bg-app-status-danger/15 text-app-status-danger",
  paid: "bg-app-status-positive/15 text-app-status-positive",
  cancelled: "bg-app-fill-f1 text-app-label-tertiary line-through",
};

export interface InstallmentLine {
  id: string;
  number: number;
  due_date: string;
  /** The amount scheduled when the plan opened. */
  scheduled_amount: Money;
  /** After returns cut the schedule (from the last installment backwards). */
  amount: Money;
  paid_amount: Money;
  remaining: Money;
  status: InstallmentLineStatus;
  status_label: string;
  days_overdue: number;
}

export interface InstallmentTotals {
  amount: Money;
  paid: Money;
  remaining: Money;
  overdue: Money;
}

/** A sale's schedule as `installment_plan` on the sale JSON (null when it has none). */
export interface InstallmentPlan {
  id: string;
  sales_order_id: string;
  client_id: string;
  financed_amount: Money;
  down_payment: Money;
  installment_count: number;
  frequency: string;
  frequency_label: string;
  first_due_date: string;
  created_by: string | number | null;
  created_at: string | null;
  as_of: string;
  lines: InstallmentLine[];
  totals: InstallmentTotals;
}

/** Plan fields at checkout (under `installment_plan`) and on POST /sales/{id}/installment-plan. */
export interface InstallmentPlanInput {
  count: number;
  first_due_date: string;
  down_payment?: number;
  down_payment_method?: "cash" | "bank";
  cash_account_id?: string | null;
}

/**
 * `due` is every installment still to pay (not only those due by today), so
 * it is labelled «غير المسددة»; `overdue` is only what is past its due date.
 */
export type InstallmentReportStatus = "due" | "overdue" | "all";

export const INSTALLMENT_REPORT_STATUS_LABEL: Record<InstallmentReportStatus, string> = {
  due: "الأقساط غير المسددة",
  overdue: "المتأخرة",
  all: "الكل",
};

export interface InstallmentReportFilters {
  status?: InstallmentReportStatus;
  from?: string;
  to?: string;
  client_id?: string;
}

export interface InstallmentReportRow extends InstallmentLine {
  installment_plan_id: string;
  installment_count: number;
  sales_order_id: string;
  order_number: string;
  client_id: string;
  client_name: string | null;
}

export interface InstallmentReport {
  as_of: string;
  status: InstallmentReportStatus;
  data: InstallmentReportRow[];
  totals: InstallmentTotals & { count: number };
}

/**
 * The installment amounts the backend will schedule: equal parts floored to
 * the dirham (3 decimals), the last taking the remainder. A preview only.
 */
export function previewInstallments(financed: number, count: number): { base: number; last: number } | null {
  if (!Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS || !(financed > 0)) return null;
  const dirhams = Math.round(financed * 1000);
  const base = Math.floor(dirhams / count) / 1000;
  if (count > 1 && base <= 0) return null;
  return { base, last: Math.round((financed - base * (count - 1)) * 10000) / 10000 };
}

/** The same calendar day `months` later, clamped to the month's end (Carbon addMonthsNoOverflow). */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
}

export const installmentsApi = {
  report: (params?: InstallmentReportFilters) => apiClient.get<InstallmentReport>("/installments", { params }),
  addPlan: (saleId: string, data: InstallmentPlanInput) =>
    apiClient.post<InstallmentPlan>(`/sales/${saleId}/installment-plan`, data),
};
