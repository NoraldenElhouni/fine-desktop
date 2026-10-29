import apiClient from "../client";
import { LEDGER_ERROR_MESSAGE, apiErrorMessage, apiErrorPayload } from "./production";
import type { ApiErrorPayload } from "./production";

/** W4-01 (decision #13): draft → counting → submitted → approved | cancelled. */
export type StockCountStatus = "draft" | "counting" | "submitted" | "approved" | "cancelled";

export const STOCK_COUNT_STATUS_LABEL: Record<StockCountStatus, string> = {
  draft: "مسودة",
  counting: "قيد العدّ",
  submitted: "بانتظار الاعتماد",
  approved: "معتمد",
  cancelled: "ملغى",
};

export const STOCK_COUNT_STATUS_STYLE: Record<StockCountStatus, string> = {
  draft: "bg-app-bg-secondary text-app-label-secondary",
  counting: "bg-app-accent/15 text-app-accent",
  submitted: "bg-app-status-warning/15 text-app-status-warning",
  approved: "bg-app-status-positive/15 text-app-status-positive",
  cancelled: "bg-app-status-danger/15 text-app-status-danger",
};

/** The happy path, for the status-chip bar. */
export const STOCK_COUNT_STATUS_ORDER: StockCountStatus[] = ["draft", "counting", "submitted", "approved"];

export const LOT_STATUS_LABEL: Record<string, string> = {
  available: "متاح",
  quarantined: "حجر صحي",
  reserved: "محجوز",
  consumed: "مستهلك",
};

/** Quantities and money arrive as decimal strings (decimal:4 casts). */
type Decimal = number | string;

interface NamedRef {
  id: string;
  name: string;
}

export interface StockCountLine {
  id: string;
  stock_count_id: string;
  stock_lot_id: string | null;
  inventory_item_id: string;
  item_code: string | null;
  item_name: string | null;
  item_type: string | null;
  unit_of_measure: string | null;
  lot_number: string | null;
  /** The lot's shelf (W4-02); null for found stock and unshelved lots. */
  bin_location: string | null;
  lot_status: string | null;
  grade: string | null;
  is_found: boolean;
  /** null while a blind count is still being entered. */
  system_qty: Decimal | null;
  counted_qty: Decimal | null;
  unit_cost: Decimal | null;
  variance_qty: Decimal | null;
  variance_value: Decimal | null;
  new_stock_lot_id: string | null;
  new_lot_number: string | null;
  note: string | null;
}

/** A lot the count leaves out (reserved by a cutter order / sale, or of an open production batch). */
export interface StockCountExcludedLot {
  id: string;
  inventory_item_id: string;
  warehouse_id: string;
  production_batch_id?: string | null;
  lot_number: string;
  quantity: Decimal;
  unit_cost: Decimal;
  status: string;
  reason?: string;
  inventory_item?: { id: string; name: string; code: string; item_type?: string; unit_of_measure?: string | null } | null;
}

export interface StockCountSummary {
  lines_total: number;
  lines_counted: number;
  found_lines: number;
  /** The variance figures are absent while a blind count hides system quantities. */
  shortage_qty?: number;
  shortage_value?: number;
  surplus_qty?: number;
  surplus_value?: number;
  net_value?: number;
}

/** A row of GET /stock-counts (index). */
export interface StockCountListItem {
  id: string;
  operating_unit_id: string;
  warehouse_id: string;
  item_category_id: string | null;
  number: string;
  count_date: string;
  status: StockCountStatus;
  blind: boolean;
  created_by_user_id: string | null;
  submitted_by_user_id: string | null;
  approved_by_user_id: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  journal_entry_id: string | null;
  notes: string | null;
  record_version: number;
  created_at: string;
  lines_count?: number;
  warehouse?: NamedRef | null;
  category?: NamedRef | null;
  created_by?: NamedRef | null;
  submitted_by?: NamedRef | null;
  approved_by?: NamedRef | null;
}

/** GET /stock-counts/{id} and every mutation response (StockCountService::present). */
export interface StockCount extends StockCountListItem {
  category?: (NamedRef & { code?: string }) | null;
  journal_entry?: { id: string; reference: string | null; entry_date: string } | null;
  system_quantities_hidden: boolean;
  summary: StockCountSummary;
  lines: StockCountLine[];
  reserved_lots: StockCountExcludedLot[];
  excluded_lots: StockCountExcludedLot[];
}

export interface StockCountSheetRow {
  no: number;
  line_id: string;
  item_code: string | null;
  item_name: string | null;
  unit_of_measure: string | null;
  lot_number: string | null;
  /** The lot's shelf (W4-02), printed so the counter can find it. */
  bin_location: string | null;
  is_found: boolean;
  system_qty: Decimal | null;
  counted_qty: Decimal | null;
  variance_qty: Decimal | null;
  note: string | null;
}

/** GET /stock-counts/{id}/sheet — the printable count sheet. */
export interface StockCountSheet {
  number: string;
  count_date: string;
  status: StockCountStatus;
  blind: boolean;
  system_quantities_hidden: boolean;
  operating_unit: NamedRef | null;
  warehouse: NamedRef | null;
  category: (NamedRef & { code?: string }) | null;
  notes: string | null;
  created_by: NamedRef | null;
  printed_at: string;
  rows: StockCountSheetRow[];
  summary: StockCountSummary;
  reserved_lots: StockCountExcludedLot[];
  excluded_lots: StockCountExcludedLot[];
}

export interface StockCountListParams {
  status?: string;
  warehouse_id?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateStockCountPayload {
  warehouse_id: string;
  item_category_id?: string | null;
  count_date?: string | null;
  blind?: boolean;
  notes?: string | null;
}

export interface StockCountLineInput {
  id: string;
  counted_qty: number | null;
  note?: string | null;
}

export interface AddFoundPayload {
  inventory_item_id: string;
  counted_qty: number;
  note?: string | null;
}

export const stockCountsApi = {
  list: (params?: StockCountListParams) =>
    apiClient.get<{ data: StockCountListItem[]; current_page: number; last_page: number; total: number }>(
      "/stock-counts",
      { params },
    ),

  get: (id: string) => apiClient.get<StockCount>(`/stock-counts/${id}`),

  sheet: (id: string) => apiClient.get<StockCountSheet>(`/stock-counts/${id}/sheet`),

  create: (data: CreateStockCountPayload) => apiClient.post<StockCount>("/stock-counts", data),

  updateLines: (id: string, lines: StockCountLineInput[]) =>
    apiClient.put<StockCount>(`/stock-counts/${id}/lines`, { lines }),

  addFound: (id: string, data: AddFoundPayload) => apiClient.post<StockCount>(`/stock-counts/${id}/found`, data),

  submit: (id: string) => apiClient.post<StockCount>(`/stock-counts/${id}/submit`),

  approve: (id: string) => apiClient.post<StockCount>(`/stock-counts/${id}/approve`),

  cancel: (id: string) => apiClient.post<StockCount>(`/stock-counts/${id}/cancel`),
};

/** Stock count refusals (StockCountService) in the user's language. */
export const STOCK_COUNT_ERROR_MESSAGE: Record<string, string> = {
  ...LEDGER_ERROR_MESSAGE,
  COUNT_DATE_IN_FUTURE: "لا يمكن أن يكون تاريخ الجرد في المستقبل.",
  COUNT_DATE_BEFORE_SNAPSHOT: "لا يمكن أن يسبق تاريخ الجرد يوم فتحه — اللقطة تحمل كميات ذلك اليوم.",
  COUNT_ALREADY_OPEN: "يوجد جرد مفتوح لهذا المخزن — اعتمده أو ألغِه أولاً.",
  COUNT_LINE_NOT_FOUND: "هذا السطر لا يخص الجرد — أعد تحميل الصفحة.",
  INVALID_QUANTITY: "الكمية المعدودة غير صحيحة: لا تكون سالبة، وكمية المخزون الموجود غير المسجل أكبر من صفر.",
  COUNT_FOAM_BLOCK_QUANTITY: "لوت البلوك يحمل بلوكاً واحداً، فعدّه 0 أو 1 فقط — أضف كل بلوك موجود غير مسجل كسطر مستقل.",
  COUNT_FOUND_OUT_OF_SCOPE: "هذا الصنف خارج فئة الجرد، فلا يُضاف كمخزون موجود غير مسجل.",
  COUNT_FOUND_COST_UNKNOWN: "لا توجد لهذا الصنف تكلفة في هذا المخزن ولا سعر تكلفة، فلا يمكن تقييم المخزون الموجود منه — حدّد سعر تكلفة الصنف أولاً.",
  COUNT_INCOMPLETE: "توجد أسطر لم تُدخل كميتها المعدودة بعد — أكمل العدّ قبل الإرسال.",
  COUNT_NOT_EDITABLE: "تم إرسال هذا الجرد أو إغلاقه، فلا يمكن تعديله.",
  COUNT_STATUS_INVALID: "هذا الإجراء غير متاح لحالة الجرد الحالية.",
  COUNT_SELF_APPROVAL: "يعتمد الجرد شخص غير الذي فتحه أو عدّه أو أرسله.",
  COUNT_LOT_MOVED: "تحرك المخزون أثناء الجرد، فلم تعد فروقاته صحيحة — ألغِ الجرد وأعد العدّ.",
  COUNT_FOUND_UNCOUNTED_LOT: "قد يكون المخزون الموجود غير المسجل هو لوت استُبعد من الجرد (تشغيلة إنتاج غير مغلقة أو لوت أُفرج عنه بعد الفتح) — أغلق التشغيلة أو ألغِ الجرد وأعد العدّ.",
  COUNT_LOT_MISSING: "أحد اللوتات المعدودة لم يعد في هذا المخزن.",
  COUNT_LOT_RESERVED: "حُجز أحد اللوتات بعد بدء الجرد — حرّره أو ألغِ الجرد.",
  INVENTORY_ACCOUNT_NOT_LINKED: "حساب المخزون أو حساب الهالك غير مربوط لهذه الوحدة — اربطه من صفحة الوحدة التشغيلية قبل الاعتماد.",
  MISSING_ACCOUNT: "حساب مطلوب للقيد غير موجود في دليل الحسابات (مثل 45 أرباح فروقات الجرد) — حدّث دليل الحسابات قبل الاعتماد.",
  UNBALANCED_JOURNAL: "قيد فروقات الجرد غير متوازن فلم يُرحّل — أعد المحاولة، وإن تكرر فأبلغ الدعم الفني.",
  ACCESS_DENIED: "ليست لديك صلاحية تنفيذ هذا الإجراء.",
};

/** The Arabic message for a stock count refusal, naming the lots it concerns when the server lists them. */
export const stockCountErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err) as
    | (ApiErrorPayload & { lot_numbers?: string[]; lot_number?: string; number?: string })
    | undefined;
  const known = payload?.code ? STOCK_COUNT_ERROR_MESSAGE[payload.code] : undefined;
  if (!known) return apiErrorMessage(err, fallback);
  if (Array.isArray(payload?.lot_numbers) && payload.lot_numbers.length > 0) {
    return `${known} (${payload.lot_numbers.join("، ")})`;
  }
  // adjustLot names a single lot (COUNT_LOT_MOVED, COUNT_LOT_RESERVED).
  if (typeof payload?.lot_number === "string" && payload.lot_number !== "") {
    return `${known} (${payload.lot_number})`;
  }
  if (payload?.code === "COUNT_ALREADY_OPEN" && payload.number) {
    return `${known} (${payload.number})`;
  }
  return known;
};

/** A decimal string or number as a number; null stays null. */
export const toQty = (v: Decimal | null | undefined): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);
