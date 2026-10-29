import apiClient from "../client";
import { LEDGER_ERROR_MESSAGE, apiErrorPayload } from "./production";
import type { InventoryItem } from "./inventory";

/** Laravel's decimal:4 cast serialises as a string ("10.0000"). */
type Decimal = number | string;

/**
 * W4-02 (FR-STK-004, FR-STK-007): an item's limits and bin in one warehouse.
 * A row whose max is 0 sets no limit and only records the bin.
 */
export interface ItemStockLevel {
  id: string;
  inventory_item_id: string;
  warehouse_id: string;
  min_qty: Decimal;
  max_qty: Decimal;
  reorder_qty: Decimal | null;
  bin_location: string | null;
  record_version: number;
  inventory_item?: InventoryItem;
  warehouse?: { id: string; name: string; parent_id?: string | null };
  created_at: string;
  updated_at: string;
}

export interface ItemStockLevelFields {
  min_qty?: number | null;
  max_qty?: number | null;
  reorder_qty?: number | null;
  bin_location?: string | null;
}

export interface CreateItemStockLevelPayload extends ItemStockLevelFields {
  inventory_item_id: string;
  warehouse_id: string;
}

export interface UpdateItemStockLevelPayload extends ItemStockLevelFields {
  record_version: number;
}

/** One warehouse/item pair of GET /inventory/reorder-report. */
export interface ReorderReportRow {
  id: string;
  inventory_item_id: string;
  item_code: string | null;
  item_name: string | null;
  unit_of_measure: string | null;
  category_id: string | null;
  warehouse_id: string;
  warehouse_name: string | null;
  operating_unit_id: string | null;
  bin_location: string | null;
  on_hand: number;
  min_qty: number;
  max_qty: number;
  reorder_qty: number | null;
  /** on_hand ≤ min_qty. */
  needs_reorder: boolean;
  /** max − on_hand once it needs a reorder, else 0. */
  suggested_qty: number;
}

export interface ReorderReport {
  rows: ReorderReportRow[];
  summary: { rows: number; needs_reorder_count: number };
}

export interface ReorderReportFilters {
  warehouse_id?: string;
  category_id?: string;
}

export const stockLevelsApi = {
  list: (params?: { inventory_item_id?: string; warehouse_id?: string }) =>
    apiClient.get<ItemStockLevel[]>("/item-stock-levels", { params }),

  create: (data: CreateItemStockLevelPayload) => apiClient.post<ItemStockLevel>("/item-stock-levels", data),

  update: (id: string, data: UpdateItemStockLevelPayload) =>
    apiClient.put<ItemStockLevel>(`/item-stock-levels/${id}`, data),

  remove: (id: string) => apiClient.delete(`/item-stock-levels/${id}`),

  reorderReport: (params?: ReorderReportFilters) =>
    apiClient.get<ReorderReport>("/inventory/reorder-report", { params }),
};

/** Stock-level refusals (StockLevelService), on top of the shared ledger ones. */
export const STOCK_LEVEL_ERROR_MESSAGE: Record<string, string> = {
  ...LEDGER_ERROR_MESSAGE,
  STOCK_LEVEL_INVALID: "الحد الأقصى لا يمكن أن يكون أقل من الحد الأدنى.",
  STOCK_LEVEL_EXISTS: "لهذا الصنف حدود مسجّلة في هذا المخزن بالفعل — عدّلها بدلاً من إضافة سطر جديد.",
  OPTIMISTIC_LOCK_CONFLICT: "عدّل مستخدم آخر هذا السجل للتو — أعد فتحه وحاول مرة أخرى.",
};

/** The Arabic message for a stock-level refusal, else the server's message, else the fallback. */
export const stockLevelErrorMessage = (err: unknown, fallback: string): string => {
  const payload = apiErrorPayload(err);
  return (payload?.code && STOCK_LEVEL_ERROR_MESSAGE[payload.code]) || payload?.message || fallback;
};

/** Decimal string or number → number (null stays null). */
export const toQty = (v: Decimal | null | undefined): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);
