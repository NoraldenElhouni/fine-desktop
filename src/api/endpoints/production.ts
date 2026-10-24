import apiClient from "../client";
import { StockLot } from "./inventory";

export type ProductionBatchStatus =
  | "planned"
  | "configured"
  | "running"
  | "consumed"
  | "curing"
  | "ready_for_grading"
  | "graded"
  | "closed";

export interface ProductionFormulaParams {
  density_band?: string;
  cure_time_minutes?: number;
  conveyor_speed?: number;
  chemical_formula?: string;
}

export interface ProductionBatch {
  id: string;
  operating_unit_id: string;
  requested_by_client_id?: string;
  /** Operator-entered, incremental, never reused. Part of every block code. */
  operation_number: number;
  /** Machine setting, constant for the run — copied onto every block. */
  bun_width_m: number;
  formula_params?: ProductionFormulaParams;
  status: ProductionBatchStatus;
  material_cost: number;
  /** Non-serialized output (فاصل / بداية), tracked so yield reconciles. */
  scrap_volume_m3: number;
  next_sequence: number;
  record_version: number;
  /** Serialized blocks only — scrap is counted separately, not folded in. */
  blocks_count?: number;
  scrap_lots_count?: number;
  operating_unit?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

/**
 * One row of the paper production report: a dimension group with a count.
 * Block groups expand server-side into `count` individually labelled lots;
 * scrap groups contribute volume only and consume no sequence numbers.
 */
export interface BlockGroupInput {
  kind: "block" | "separator" | "head" | "scrap";
  block_type?: "block" | "separator" | "head" | "scrap";
  count: number;
  length_m: number;
  height_m: number;
  pressure?: number;
  inventory_item_id?: string;
  warehouse_id?: string;
  unit_cost?: number;
  grade?: "standard" | "acceptable_variant" | "defective_usable" | "reject";
  color?: string;
}

export interface RegisterBlocksResponse {
  batch: ProductionBatch;
  blocks: StockLot[];
  blocks_created: number;
  scrap_volume_m3: number;
}

export interface CreateBatchInput {
  operation_number: number;
  bun_width_m: number;
  formula_params?: ProductionFormulaParams;
  status?: ProductionBatchStatus;
  requested_by_client_id?: string;
  material_cost?: number;
  confirm_non_sequential?: boolean;
}

/**
 * Returned as a 422 when the entered operation number is not `previous + 1`.
 * This is a soft warning, not a rejection — resubmitting with
 * `confirm_non_sequential: true` succeeds. See NonSequentialWarning in the UI.
 */
export interface NonSequentialOperationError {
  message: string;
  code: "NON_SEQUENTIAL_OPERATION_NUMBER";
  expected_operation_number: number;
  entered_operation_number: number;
}

export const isNonSequentialError = (
  payload: unknown,
): payload is NonSequentialOperationError =>
  typeof payload === "object" &&
  payload !== null &&
  (payload as { code?: string }).code === "NON_SEQUENTIAL_OPERATION_NUMBER";

export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/** Pull the JSON body out of a rejected axios request without reaching for `any`. */
export const apiErrorPayload = (err: unknown): ApiErrorPayload | undefined =>
  (err as { response?: { data?: ApiErrorPayload } } | undefined)?.response?.data;

/** Ledger refusals any posting screen can hit, in the user's language. */
export const LEDGER_ERROR_MESSAGE: Record<string, string> = {
  FX_AMOUNT_MISMATCH: "المبلغ بالدينار لا يساوي المبلغ الأصلي × سعر الصرف.",
  TREASURY_REQUIRED: "اختر الخزينة أو الحساب المصرفي الذي تخرج منه الأموال أو تدخل إليه.",
  TREASURY_NOT_LINKED: "هذه الخزينة غير مربوطة بحساب في دليل الحسابات — اربطها من صفحة الخزينة أولاً.",
  UNIT_REVENUE_NOT_LINKED: "هذه الوحدة ليس لها حساب إيرادات مبيعات — حدّده من صفحة الوحدة التشغيلية قبل البيع.",
  HEADER_ACCOUNT_POSTING: "لا يمكن الترحيل إلى حساب رئيسي له حسابات فرعية — اختر الحساب الفرعي المناسب.",
  CLIENT_REQUIRED: "البيع الآجل يتطلب عميلاً.",
  LEDGER_IMMUTABLE: "القيود المرحّلة لا تُعدّل ولا تُحذف — استخدم عكس القيد.",
  ALREADY_REVERSED: "تم عكس هذا القيد مسبقاً.",
  REVERSAL_NOT_REVERSIBLE: "القيد العكسي لا يُعكس — رحّل قيداً جديداً بدلاً من ذلك.",
  CLOSING_NOT_REVERSIBLE: "قيد الإقفال لا يُعكس مباشرة — أعد فتح السنة المالية.",
  REVERSAL_DATE_BEFORE_ORIGINAL: "لا يمكن أن يسبق تاريخ القيد العكسي تاريخ القيد الأصلي.",
  ACCOUNT_IN_USE: "الحساب مرتبط بسجلات أخرى (خزينة أو عميل أو مورد…) ولا يمكن حذفه.",
  ACCOUNT_CODE_LOCKED: "لا يمكن تغيير رمز حساب عليه حركات.",
  ACCOUNT_HAS_TRANSACTIONS: "الحساب عليه حركات مرحّلة ولا يمكن حذفه.",
  ACCOUNT_FROZEN: "هذا الحساب مجمّد ولا يقبل قيوداً جديدة.",
  PERIOD_LOCKED: "الشهر المحاسبي لهذا التاريخ مقفل — لا يمكن الترحيل إليه. اختر تاريخاً في فترة مفتوحة أو اطلب من المالك إعادة فتح الشهر.",
  YEAR_CLOSED: "السنة المالية لهذا التاريخ مقفلة.",
  PERIOD_NOT_ENDED: "لا يمكن إقفال شهر لم ينتهِ بعد.",
  PERIOD_ALREADY_LOCKED: "هذا الشهر مقفل بالفعل.",
  PERIOD_NOT_LOCKED: "هذا الشهر غير مقفل.",
  PERIOD_LOCK_OUT_OF_ORDER: "يجب إقفال الأشهر السابقة أولاً.",
  FISCAL_CALENDAR_IN_USE: "لا يمكن تغيير بداية السنة المالية بعد إقفال أي شهر.",
  ENTRY_DATE_OUT_OF_RANGE: "التاريخ بعيد جداً في المستقبل — تحقق منه.",
  ACCOUNT_NAME_DUPLICATE: "يوجد حساب آخر بنفس الاسم تحت الحساب الأب نفسه.",
  YEAR_ALREADY_CLOSED: "السنة المالية مقفلة بالفعل.",
  YEAR_NOT_ENDED: "لا يمكن إقفال السنة قبل انتهائها.",
  PREVIOUS_YEAR_OPEN: "يجب إقفال السنة المالية السابقة أولاً.",
  YEAR_PERIODS_NOT_LOCKED: "يجب إقفال جميع أشهر السنة أولاً.",
  RETAINED_EARNINGS_NOT_POSTABLE: "حساب الأرباح والخسائر المرحلة (33) غير متاح للترحيل.",
  YEAR_NOT_CLOSED: "السنة المالية مفتوحة.",
  LATER_YEAR_CLOSED: "لا يمكن إعادة فتح السنة لأن سنة لاحقة مقفلة.",
  VOUCHER_COUNTER_IS_TREASURY: "لا يمكن استخدام حساب خزينة كطرف مقابل — استخدم التحويل بين الخزائن.",
  VOUCHER_ALREADY_CANCELLED: "السند ملغى بالفعل.",
  INVALID_AMOUNT: "المبلغ يجب أن يكون أكبر من صفر.",
  TRANSFER_SAME_TREASURY: "لا يمكن التحويل إلى نفس الخزينة.",
  TRANSFER_CURRENCY_MISMATCH: "عملة الخزينتين مختلفة — تحويل العملات يتم عبر المشتريات.",
  TRANSFER_INSUFFICIENT_BALANCE: "رصيد الخزينة المحوَّل منها لا يكفي.",
  TRANSFER_SELF_APPROVAL: "لا يمكنك اعتماد تحويل أنشأته بنفسك.",
  TRANSFER_NOT_PENDING: "التحويل ليس بانتظار الاعتماد.",
  TRANSFER_APPROVAL_FORBIDDEN: "ليست لديك صلاحية اعتماد التحويلات.",
  FX_RATE_REQUIRED: "سعر الصرف مطلوب للعملات الأجنبية.",
  RECONCILIATION_NOT_BANK: "التسوية المصرفية متاحة لحسابات المصارف فقط.",
  RECONCILIATION_DRAFT_EXISTS: "توجد تسوية مفتوحة لهذا الحساب — أكملها أو احذفها أولاً.",
  RECONCILIATION_DATE_BEFORE_LAST: "تاريخ الكشف يجب أن يكون بعد آخر تسوية منتهية.",
  RECONCILIATION_FINISHED: "التسوية منتهية ولا يمكن تعديلها.",
  RECONCILIATION_NOT_BALANCED: "لا يمكن إنهاء التسوية قبل أن يصبح الفرق صفراً.",
  LINE_NOT_RECONCILABLE: "هذا القيد لا يخص حساب المصرف أو تاريخه بعد تاريخ الكشف.",
  LINE_ALREADY_RECONCILED: "هذا القيد مُسوّى في تسوية أخرى.",
  RECONCILIATION_FORBIDDEN: "ليست لديك صلاحية التسوية المصرفية.",
  CHEQUE_CURRENCY_UNSUPPORTED: "الشيكات بالدينار الليبي فقط حالياً.",
  CHEQUE_DEPOSIT_NOT_BANK: "يجب إيداع الشيك في حساب مصرفي.",
  CHEQUE_NOT_CERTIFIED: "التحصيل المباشر من الحافظة للشيكات المصدقة فقط.",
  INVALID_CHEQUE_TRANSITION: "هذا الإجراء غير متاح لحالة الشيك الحالية.",
  CHEQUE_DATE_BEFORE_LAST_EVENT: "تاريخ الإجراء يسبق آخر حركة على الشيك.",
  CHEQUE_FORBIDDEN: "ليست لديك صلاحية إدارة الشيكات.",
};

/** The Arabic message for a known refusal code, else the server's message, else the fallback. */
export const apiErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err);
  return (payload?.code && LEDGER_ERROR_MESSAGE[payload.code]) || payload?.message || fallback;
};

/** Blocks are keyed in from the completed sheet, so only these states accept them. */
export const BLOCK_ENTRY_STATES: ProductionBatchStatus[] = ["ready_for_grading", "graded"];

/** The lifecycle is strictly linear (Phase 04 §4.4) — one step, no branching. */
export const NEXT_STATUS: Record<ProductionBatchStatus, ProductionBatchStatus | null> = {
  planned: "configured",
  configured: "running",
  running: "consumed",
  consumed: "curing",
  curing: "ready_for_grading",
  ready_for_grading: "graded",
  graded: "closed",
  closed: null,
};

/** The machine's physical pour width (FOAM-01). */
export const MAX_BUN_WIDTH_M = 2.4;

export const productionApi = {
  transition: (id: string, status: ProductionBatchStatus) =>
    apiClient.post<ProductionBatch>(`/production-batches/${id}/transition`, { status }),

  getBatches: (params?: { status?: string; page?: number; per_page?: number }) =>
    apiClient.get<{ data: ProductionBatch[]; current_page: number; last_page: number }>(
      "/production-batches",
      { params },
    ),

  getBatch: (id: string) => apiClient.get<ProductionBatch>(`/production-batches/${id}`),

  createBatch: (data: CreateBatchInput) =>
    apiClient.post<ProductionBatch>("/production-batches", data),

  updateBatch: (id: string, data: Partial<CreateBatchInput> & { record_version: number }) =>
    apiClient.put<ProductionBatch>(`/production-batches/${id}`, data),

  deleteBatch: (id: string) => apiClient.delete(`/production-batches/${id}`),

  registerBlocks: (id: string, groups: BlockGroupInput[]) =>
    apiClient.post<RegisterBlocksResponse>(`/production-batches/${id}/blocks`, { groups }),

  getBatchBlocks: (batchId: string) =>
    apiClient.get<{ data: StockLot[] }>("/stock-lots", {
      params: { production_batch_id: batchId, per_page: 200 },
    }),
};
