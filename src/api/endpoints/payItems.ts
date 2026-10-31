import apiClient from "../client";
import { LEDGER_ERROR_MESSAGE, apiErrorPayload } from "./production";
import { formatDate, formatNumber } from "../../lib/utils/format";

/**
 * W5-03 (HR-13): rewards and deductions. Standing pay items recur in every
 * month they are in force (written by the pay roles: HR manager, accounting
 * manager, owner); one-off adjustments apply to one period once approved (HR
 * enters drafts, an approve-pay-adjustments holder approves). Payroll adds
 * them: gross = base + attendance + additions, and each deduction is credited
 * by its type's account role (liability → 225, expense_reduction → 57).
 */

export type PayItemKind = "addition" | "deduction";
export type PayItemCalculation = "fixed" | "percent_of_base";
export type EmployeeAdjustmentStatus = "draft" | "approved";
export type DeductionAccountRole = "liability" | "expense_reduction";

export const PAY_ITEM_KIND_LABEL: Record<PayItemKind, string> = {
  addition: "استحقاق",
  deduction: "استقطاع",
};

/** The one-off wording on the monthly adjustments page. */
export const ADJUSTMENT_KIND_LABEL: Record<PayItemKind, string> = {
  addition: "مكافأة",
  deduction: "جزاء / خصم",
};

export const PAY_ITEM_CALC_LABEL: Record<PayItemCalculation, string> = {
  fixed: "مبلغ ثابت",
  percent_of_base: "نسبة من الأساسي",
};

export const ADJUSTMENT_STATUS_LABEL: Record<EmployeeAdjustmentStatus, string> = {
  draft: "مسودة",
  approved: "معتمدة",
};

export const DEDUCTION_ROLE_LABEL: Record<DeductionAccountRole, string> = {
  liability: "استقطاع يُسدَّد لجهة (225)",
  expense_reduction: "خصم من مصروف الرواتب (57)",
};

/** The reference-lookup category a kind's codes come from (PayItemKind::lookupCategory). */
export const PAY_KIND_LOOKUP: Record<PayItemKind, string> = {
  addition: "allowance-types",
  deduction: "deduction-types",
};

/** Advance recovery comes only from the advance schedule (ADVANCE_DEDUCTION_MANUAL). */
export const ADVANCE_PAY_CODES = ["ADVANCE", "DED-ADV"];

export interface EmployeePayItem {
  id: string;
  employee_id: string;
  code: string;
  kind: PayItemKind;
  calc: PayItemCalculation;
  value: number;
  /** YYYY-MM-DD; an item touching any day of a month is in force for the whole month. */
  effective_from: string;
  effective_to: string | null;
  active: boolean;
  notes: string | null;
  created_by: { id: string; name: string } | null;
  record_version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeAdjustment {
  id: string;
  employee_id: string;
  employee: {
    id: string;
    employee_number: string | null;
    name: string | null;
    operating_unit_id: string;
  } | null;
  /** YYYY-MM */
  period: string;
  kind: PayItemKind;
  code: string;
  amount: number;
  reason: string;
  status: EmployeeAdjustmentStatus;
  created_by: { id: string; name: string } | null;
  approved_by: { id: string; name: string } | null;
  approved_at: string | null;
  record_version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeAdjustmentPage {
  data: EmployeeAdjustment[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface EmployeeAdjustmentFilters {
  employee_id?: string;
  period?: string;
  status?: EmployeeAdjustmentStatus;
  kind?: PayItemKind;
  page?: number;
  per_page?: number;
}

export interface PayItemPayload {
  kind: PayItemKind;
  code: string;
  calc: PayItemCalculation;
  value: number;
  effective_from: string;
  effective_to?: string | null;
  active?: boolean;
  notes?: string | null;
}

export interface AdjustmentPayload {
  employee_id: string;
  period: string;
  kind: PayItemKind;
  code: string;
  amount: number;
  reason: string;
}

export const payItemsApi = {
  list: async (employeeId: string): Promise<EmployeePayItem[]> =>
    (await apiClient.get<{ data: EmployeePayItem[] }>(`/employees/${employeeId}/pay-items`)).data.data,

  create: async (employeeId: string, payload: PayItemPayload): Promise<EmployeePayItem> =>
    (await apiClient.post<{ data: EmployeePayItem }>(`/employees/${employeeId}/pay-items`, payload)).data.data,

  /** Send only what changes; an item frozen by payroll takes only effective_to, active and notes. */
  update: async (
    employeeId: string,
    itemId: string,
    payload: Partial<PayItemPayload> & { record_version?: number },
  ): Promise<EmployeePayItem> =>
    (await apiClient.put<{ data: EmployeePayItem }>(`/employees/${employeeId}/pay-items/${itemId}`, payload)).data.data,

  remove: async (employeeId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/employees/${employeeId}/pay-items/${itemId}`);
  },
};

export const employeeAdjustmentsApi = {
  list: async (filters?: EmployeeAdjustmentFilters): Promise<EmployeeAdjustmentPage> =>
    (await apiClient.get<EmployeeAdjustmentPage>("/employee-adjustments", { params: filters })).data,

  create: async (payload: AdjustmentPayload): Promise<EmployeeAdjustment> =>
    (await apiClient.post<{ data: EmployeeAdjustment }>("/employee-adjustments", payload)).data.data,

  /** Drafts only (PAY_ADJUSTMENT_NOT_DRAFT); the employee is fixed. */
  update: async (
    id: string,
    payload: Partial<Omit<AdjustmentPayload, "employee_id">> & { record_version?: number },
  ): Promise<EmployeeAdjustment> =>
    (await apiClient.put<{ data: EmployeeAdjustment }>(`/employee-adjustments/${id}`, payload)).data.data,

  approve: async (id: string): Promise<EmployeeAdjustment> =>
    (await apiClient.post<{ data: EmployeeAdjustment }>(`/employee-adjustments/${id}/approve`)).data.data,

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/employee-adjustments/${id}`);
  },
};

/** The roles the approve route accepts (with the approve-pay-adjustments permission). */
export const ADJUSTMENT_APPROVER_ROLES = ["owner", "accounting-manager", "hr-manager"];

export const formatPayMoney = (v: number | string | null | undefined): string =>
  formatNumber(v, { maximumFractionDigits: 4 });

const PAY_ITEM_MESSAGE: Record<string, string> = {
  PAY_ITEM_FORBIDDEN: "تعديل البدلات والاستقطاعات الثابتة من صلاحية مدير الموارد البشرية أو مدير الحسابات أو المالك فقط.",
  PAY_ADJUSTMENT_DELETE_FORBIDDEN:
    "حذف مكافأة أو جزاء معتمد من صلاحية من يعتمدها فقط (المالك أو مدير الحسابات أو مدير الموارد البشرية).",
  PAY_ADJUSTMENT_NOT_DRAFT: "لا يُعدَّل ولا يُعتمد إلا المسودة — احذف المعتمد وأدخله من جديد.",
  PAY_CODE_UNKNOWN: "النوع المختار غير موجود أو موقوف في البيانات المرجعية (أنواع العلاوات / أنواع الخصومات).",
  PAY_ITEM_INVALID_VALUE: "القيمة يجب أن تكون أكبر من صفر، والنسبة لا تتجاوز 100٪.",
  PAY_ADJUSTMENT_INVALID_AMOUNT: "المبلغ يجب أن يكون أكبر من صفر.",
  PAY_ITEM_INVALID_RANGE: "تاريخ النهاية يسبق تاريخ البداية.",
  PAY_ITEM_PERIOD_CLOSED: "مسير الرواتب تجاوز المراجعة حتى هذا التاريخ، فلا يبدأ البند إلا بعده.",
  PAY_ITEM_FROZEN:
    "طُبّق هذا البند في مسير رواتب تجاوز المراجعة، فلا تتغير شروطه ولا يُحذف — يُنهى بتاريخ نهاية أو يُوقف. لتغيير قيمته أنهِه في آخر يوم من آخر شهر يُصرف فيه، وأضف بنداً جديداً من الشهر التالي.",
  PAY_ITEM_OVERLAP:
    "للموظف بند نشط من النوع نفسه يسري في الأشهر نفسها — أنهِ البند السابق في آخر يوم من الشهر الذي يسبق بداية هذا البند.",
  PAY_EMPLOYEE_NOT_ON_PAYROLL: "المسير لا يصرف لهذا الموظف (منتهي الخدمة أو بالقطعة)، فلا تُسجَّل له بدلات أو استقطاعات.",
  OPTIMISTIC_LOCK_CONFLICT: "عدّل مستخدم آخر هذا البند للتو — أغلق النافذة وأعد فتحها ثم حاول مرة أخرى.",
};

/** Arabic text for a pay item or adjustment refusal, with the frozen date the server sent. */
export const payItemErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err);
  const code = payload?.code;
  const base =
    (code && (PAY_ITEM_MESSAGE[code] ?? LEDGER_ERROR_MESSAGE[code])) ||
    (payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined) ||
    payload?.message ||
    fallback;

  if (code === "PAY_ITEM_FROZEN" && payload?.earliest_end) {
    return `${base} أقرب تاريخ نهاية مسموح: ${formatDate(payload.earliest_end)}.`;
  }
  if ((code === "PAY_ITEM_PERIOD_CLOSED" || code === "PAY_PERIOD_CLOSED") && payload?.frozen_until) {
    return `${base} آخر يوم مُقفل: ${formatDate(payload.frozen_until)}.`;
  }
  return base;
};
