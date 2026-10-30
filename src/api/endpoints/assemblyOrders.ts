import apiClient from "../client";
import { LEDGER_ERROR_MESSAGE, apiErrorMessage, apiErrorPayload } from "./production";
import type { ApiErrorPayload } from "./production";
import { formatNumber } from "../../lib/utils/format";

/**
 * W4-07 (decision #12): furniture assembly orders (ASM-). A draft reserves
 * nothing; completing it consumes the component lots and produces the
 * finished-goods lot (FG-) at the summed actual cost (DR 1134 / CR each
 * component lot's account). Completion and cancellation are terminal.
 */
export type AssemblyOrderStatus = "draft" | "completed" | "cancelled";

export const ASSEMBLY_STATUS_LABEL: Record<AssemblyOrderStatus, string> = {
  draft: "مسودة",
  completed: "مكتمل",
  cancelled: "ملغى",
};

export const ASSEMBLY_STATUS_STYLE: Record<AssemblyOrderStatus, string> = {
  draft: "bg-app-bg-secondary text-app-label-secondary",
  completed: "bg-app-status-positive/15 text-app-status-positive",
  cancelled: "bg-app-status-danger/15 text-app-status-danger",
};

/** The happy path, for the status-chip bar. */
export const ASSEMBLY_STATUS_ORDER: AssemblyOrderStatus[] = ["draft", "completed"];

/** Quantities and money arrive as decimal strings (decimal casts). */
type Decimal = number | string;

interface NamedRef {
  id: string;
  name: string;
}

export interface AssemblyItemRef {
  id: string;
  name: string;
  code: string;
  item_type?: string;
  unit_of_measure?: string | null;
}

export interface AssemblyLotRef {
  id: string;
  lot_number: string;
  quantity: Decimal;
  unit_cost: Decimal;
  status: string;
  warehouse_id: string;
  bin_location?: string | null;
}

export interface AssemblyOrderLine {
  id: string;
  assembly_order_id: string;
  inventory_item_id: string;
  /** Null on a draft line left to completion (oldest matching lot first). */
  stock_lot_id: string | null;
  quantity: Decimal;
  /** The piece size (metres): a sized line draws only lots of that size, in any orientation. */
  length_m: Decimal | null;
  width_m: Decimal | null;
  height_m: Decimal | null;
  /** The drawn lot's actual cost, set on completion. */
  unit_cost: Decimal | null;
  position: number;
  inventory_item: AssemblyItemRef | null;
  stock_lot: AssemblyLotRef | null;
  /** quantity × unit_cost, null until completion. */
  total_cost: number | null;
}

/** A row of GET /assembly-orders (index). */
export interface AssemblyOrderListItem {
  id: string;
  operating_unit_id: string;
  number: string;
  finished_item_id: string;
  quantity: Decimal;
  output_warehouse_id: string;
  status: AssemblyOrderStatus;
  bundle_id: string | null;
  notes: string | null;
  total_cost: Decimal | null;
  finished_stock_lot_id: string | null;
  journal_entry_id: string | null;
  created_by_user_id: string | null;
  completed_by_user_id: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  record_version: number;
  created_at: string;
  lines_count?: number;
  finished_item?: AssemblyItemRef | null;
  output_warehouse?: NamedRef | null;
  bundle?: NamedRef | null;
  finished_stock_lot?: { id: string; lot_number: string } | null;
  created_by?: NamedRef | null;
  completed_by?: NamedRef | null;
}

/** GET /assembly-orders/{id} and every mutation response (AssemblyOrderService::present). */
export interface AssemblyOrder extends AssemblyOrderListItem {
  finished_stock_lot?: AssemblyLotRef | null;
  /** Every lot the order produced: two when one unit carries the rounding remainder. */
  finished_stock_lots: AssemblyLotRef[];
  journal_entry?: { id: string; reference: string | null; entry_date: string } | null;
  lines: AssemblyOrderLine[];
  summary: {
    lines_total: number;
    total_cost: number | null;
    unit_cost: number | null;
  };
}

export interface AssemblyOrderListParams {
  status?: string;
  finished_item_id?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AssemblyOrderLineInput {
  inventory_item_id: string;
  quantity: number;
  stock_lot_id?: string | null;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
}

export interface CreateAssemblyOrderPayload {
  finished_item_id: string;
  quantity: number;
  output_warehouse_id: string;
  bundle_id?: string | null;
  notes?: string | null;
  /** Required without a bundle; with one, omitted lines are filled from its items × quantity. */
  lines?: AssemblyOrderLineInput[];
}

export const assemblyOrdersApi = {
  list: (params?: AssemblyOrderListParams) =>
    apiClient.get<{ data: AssemblyOrderListItem[]; current_page: number; last_page: number; total: number }>(
      "/assembly-orders",
      { params },
    ),

  get: (id: string) => apiClient.get<AssemblyOrder>(`/assembly-orders/${id}`),

  create: (data: CreateAssemblyOrderPayload) => apiClient.post<AssemblyOrder>("/assembly-orders", data),

  complete: (id: string, recordVersion?: number) =>
    apiClient.post<AssemblyOrder>(`/assembly-orders/${id}/complete`, { record_version: recordVersion }),

  cancel: (id: string, recordVersion?: number) =>
    apiClient.post<AssemblyOrder>(`/assembly-orders/${id}/cancel`, { record_version: recordVersion }),
};

/** Assembly order refusals (AssemblyOrderService and the ledger it posts to) in the user's language. */
export const ASSEMBLY_ERROR_MESSAGE: Record<string, string> = {
  ...LEDGER_ERROR_MESSAGE,
  ASSEMBLY_NOT_FINISHED_GOOD: "المنتج المختار ليس منتج أثاث تاماً — أمر التجميع ينتج أصناف «منتج أثاث تام» فقط.",
  ASSEMBLY_ITEM_DELETED: "حُذف المنتج النهائي لهذا الأمر، فلا يمكن تجميعه — ألغِ الأمر.",
  ASSEMBLY_NO_COMPONENTS: "أمر التجميع يحتاج مكوّناً واحداً على الأقل.",
  ASSEMBLY_COMPONENT_IS_PRODUCT: "لا يكون المنتج مكوّناً لنفسه — احذف سطر المنتج من المكونات.",
  ASSEMBLY_LOT_REJECTED: "أحد اللوتات المختارة لم يعد مخزوناً متاحاً لهذا المكوّن في مخازن الوحدة (ربما استُهلك أو حُجز، أو من تشغيلة إنتاج غير مغلقة) — اختر لوتاً آخر أو اتركه للاختيار التلقائي.",
  ASSEMBLY_LOT_SIZE_MISMATCH: "مقاس اللوت المختار لا يطابق مقاس المكوّن.",
  ASSEMBLY_STATUS_INVALID: "هذا الإجراء غير متاح لحالة الأمر الحالية — أعد تحميل الصفحة.",
  INSUFFICIENT_STOCK: "المخزون المتاح في مخازن الوحدة لا يغطي مكونات الأمر — لم يُستهلك شيء.",
  INVALID_QUANTITY: "الكمية يجب أن تكون أكبر من صفر (0.0001 على الأقل).",
  SERIALIZED_QUANTITY_INVALID: "البلوك الإسفنجي يُصرف كاملاً فقط — اجعل كمية مكوّن البلوك عدداً صحيحاً من البلوكات.",
  OPTIMISTIC_LOCK_CONFLICT: "عدّل مستخدم آخر هذا الأمر للتو — أعد تحميل الصفحة وحاول مرة أخرى.",
  INVENTORY_ACCOUNT_NOT_LINKED: "حساب المخزون غير مربوط لهذه الوحدة — اربطه من صفحة الوحدة التشغيلية قبل الإتمام.",
  MISSING_ACCOUNT: "حساب مطلوب للقيد غير موجود في دليل الحسابات (مثل 1134 مخزون الأثاث التام) — حدّث دليل الحسابات قبل الإتمام.",
  UNBALANCED_JOURNAL: "قيد التجميع غير متوازن فلم يُرحّل — أعد المحاولة، وإن تكرر فأبلغ الدعم الفني.",
  ACCESS_DENIED: "ليست لديك صلاحية تنفيذ هذا الإجراء.",
};

interface AssemblyShortfall {
  inventory_item_id: string;
  code?: string | null;
  stock_lot_id?: string | null;
  lot_number?: string | null;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  required: number;
  available: number;
}

const qty4 = (v: number | null | undefined): string => formatNumber(v, { maximumFractionDigits: 4 });

/**
 * The Arabic message for an assembly refusal. A stock shortfall also names each
 * short component (and size) and each hand-picked lot that cannot cover its lines.
 */
export const assemblyErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err) as (Omit<ApiErrorPayload, "shortfalls"> & { shortfalls?: AssemblyShortfall[] }) | undefined;
  const known = payload?.code ? ASSEMBLY_ERROR_MESSAGE[payload.code] : undefined;
  // A Laravel validation refusal (field `errors`, no code) carries English text only.
  if (!known && !payload?.code && payload?.errors) return "بيانات الأمر غير صالحة — راجع الحقول وأعد المحاولة.";
  if (!known) return apiErrorMessage(err, fallback);
  const shortfalls = payload?.shortfalls;
  if (payload?.code !== "INSUFFICIENT_STOCK" || !Array.isArray(shortfalls) || shortfalls.length === 0) return known;
  const details = shortfalls
    .map((s) => {
      const name = s.code ?? s.inventory_item_id;
      if (s.lot_number) {
        return `اللوت ${s.lot_number} (${name}): المطلوب منه ${qty4(s.required)}، يحمل ${qty4(s.available)} فقط`;
      }
      const size =
        s.length_m != null && s.width_m != null && s.height_m != null
          ? ` ${qty4(s.length_m)}×${qty4(s.width_m)}×${qty4(s.height_m)}`
          : "";
      return `${name}${size}: المطلوب ${qty4(s.required)}، المتاح ${qty4(s.available)}`;
    })
    .join(" · ");
  return `${known} (${details})`;
};

/** A decimal string or number as a number; null stays null. */
export const toNum = (v: Decimal | null | undefined): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);

/** "L × W × H م" for a sized line, or null when it has no size. */
export const sizeLabel = (l: Decimal | null | undefined, w: Decimal | null | undefined, h: Decimal | null | undefined): string | null => {
  const dims = [toNum(l), toNum(w), toNum(h)];
  if (dims.some((d) => d === null || d <= 0)) return null;
  return `${dims.map((d) => formatNumber(d, { maximumFractionDigits: 3 })).join(" × ")} م`;
};

/** Two sizes within half a centimetre are the same piece, in any orientation (LotSize::TOLERANCE_M). */
const SIZE_TOLERANCE_M = 0.005;

/** Whether a lot is the wanted size (LotSize::matches): no size matches any lot. */
export const lotMatchesSize = (
  want: [number, number, number] | null,
  lot: { length_m?: Decimal | null; width_m?: Decimal | null; height_m?: Decimal | null },
): boolean => {
  if (want === null) return true;
  const have = [toNum(lot.length_m), toNum(lot.width_m), toNum(lot.height_m)];
  if (have.some((d) => d === null)) return false;
  const a = [...want].sort((x, y) => x - y);
  const b = (have as number[]).sort((x, y) => x - y);
  return a.every((d, i) => Math.abs(d - b[i]) <= SIZE_TOLERANCE_M);
};
