import apiClient from "../client";
import { ItemCategory } from "./categories";

export const UOM_LABELS: Record<string, string> = {
  kg: "كجم",
  liter: "لتر",
  m3: "م³",
  meter: "متر",
  each: "وحدة",
};

export interface InventoryItem {
  id: string;
  category_id?: string;
  category?: ItemCategory;
  name: string;
  code: string;
  item_type:
    | "raw_material"
    | "foam_block"
    | "cut_template_piece"
    | "slice"
    | "byproduct_fill"
    | "furniture_finished_good"
    | "packaging"
    | "barrel"
    | "pallet";
  unit_of_measure: "each" | "m3" | "kg" | "meter" | "liter" | string;
  primary_uom?: string;
  secondary_uom?: string;
  /** How much secondary_uom one primary_uom holds — 40 for a 40L barrel. */
  container_capacity?: number;
  /** The item representing this product's empty container, credited when one drains. */
  empty_container_item_id?: string;
  default_attributes?: Record<string, any>;
  /** This SKU's own length/width/height, in meters (same fields as stock_lots, per physical lot). */
  length_m?: number;
  width_m?: number;
  height_m?: number;
  volume_m3?: number;
  /** Accounting cost basis per piece or m³ */
  cost_price?: number | string | null;
  /** Procurement purchase price per piece or m³ */
  purchase_price?: number | string | null;
  /** POS starting retail price — per piece, or per m³ when price_basis is "m3". Editable at the counter. */
  selling_price?: number | string | null;
  /** Wholesale / trade selling price */
  wholesale_price?: number | string | null;
  /** Minimum selling price — per piece, or per m³ when price_basis is "m3" (FR-IVT-025, BR-PRC-003) */
  min_price?: number | string | null;
  price_basis?: PriceBasis;
  /** Only with `with_stock=1`: available quantity on the current unit's shelves. */
  available_quantity?: number | string | null;
  created_at: string;
  updated_at: string;
}

export type PriceBasis = "unit" | "m3";

export const PRICE_BASIS_LABELS: Record<PriceBasis, string> = {
  unit: "للقطعة",
  m3: "للمتر المكعب",
};

/**
 * Mirrors InventoryItem::priceFor on the backend: a "unit" item is price × qty,
 * an "m3" item is rate × L × W × H × qty (falling back to the item's own size).
 * Returns null when the item has no price or an m3 item has no size.
 */
export function suggestedPrice(
  item: Pick<InventoryItem, "selling_price" | "price_basis" | "volume_m3">,
  quantity: number,
  size?: { length_m?: number | null; width_m?: number | null; height_m?: number | null },
): number | null {
  return amountForRate(item.selling_price, item, quantity, size);
}

export function suggestedWholesalePrice(
  item: Pick<InventoryItem, "wholesale_price" | "price_basis" | "volume_m3">,
  quantity: number,
  size?: { length_m?: number | null; width_m?: number | null; height_m?: number | null },
): number | null {
  return amountForRate(item.wholesale_price, item, quantity, size);
}

/** Basis logic shared by every price helper: a per-piece rate × qty, or a per-m³ rate × L × W × H × qty. */
function amountForRate(
  rawRate: number | string | null | undefined,
  item: Pick<InventoryItem, "price_basis" | "volume_m3">,
  quantity: number,
  size?: { length_m?: number | null; width_m?: number | null; height_m?: number | null },
): number | null {
  if (rawRate === null || rawRate === undefined || rawRate === "") return null;
  const rate = Number(rawRate);
  if (item.price_basis !== "m3") return Math.round(rate * quantity * 10000) / 10000;
  const hasSize = size && size.length_m && size.width_m && size.height_m;
  const volume = hasSize
    ? Number(size.length_m) * Number(size.width_m) * Number(size.height_m)
    : item.volume_m3
      ? Number(item.volume_m3)
      : null;
  if (volume === null) return null;
  return Math.round(rate * volume * quantity * 10000) / 10000;
}

/** Mirrors InventoryItem::minPriceFor — the minimum selling price for a quantity (null when none is set). */
export function suggestedMinPrice(
  item: Pick<InventoryItem, "min_price" | "price_basis" | "volume_m3">,
  quantity: number,
  size?: { length_m?: number | null; width_m?: number | null; height_m?: number | null },
): number | null {
  return amountForRate(item.min_price, item, quantity, size);
}

/** Mirrors InventoryItem::costFor — the catalog cost for a quantity on the selling-price basis. */
export function suggestedCostPrice(
  item: Pick<InventoryItem, "cost_price" | "price_basis" | "volume_m3">,
  quantity: number,
  size?: { length_m?: number | null; width_m?: number | null; height_m?: number | null },
): number | null {
  return amountForRate(item.cost_price, item, quantity, size);
}

type ClearableItemField =
  | "primary_uom"
  | "secondary_uom"
  | "container_capacity"
  | "length_m"
  | "width_m"
  | "height_m"
  | "cost_price"
  | "purchase_price"
  | "selling_price"
  | "wholesale_price"
  | "min_price";

/** Create/update body — `null` clears a field on the backend, `undefined` leaves it untouched. */
export type InventoryItemPayload = Partial<Omit<InventoryItem, ClearableItemField>> & {
  [K in ClearableItemField]?: InventoryItem[K] | null;
};

export interface StockLot {
  id: string;
  inventory_item_id: string;
  warehouse_id: string;
  /** Shelf/bin inside the warehouse (W4-02, FR-STK-004); defaults from the item's level row. */
  bin_location?: string | null;
  lot_number: string;
  quantity: number;
  container_quantity?: number;
  length_m?: number;
  width_m?: number;
  height_m?: number;
  volume_m3?: number;
  weight_kg?: number;
  unit_cost: number;
  grade: "standard" | "acceptable_variant" | "defective_usable" | "reject";
  status: "available" | "reserved" | "consumed" | "quarantined";
  attribute_values?: Record<string, any>;
  production_batch_id?: string;
  /** Ordinal position within a foam production run; null for non-foam lots. */
  sequence_in_batch?: number;
  /** Measured at grading; part of the block code. Null for non-foam lots. */
  pressure?: number;
  /** Block type: block (بلوك), separator (فاصل), head (بداية), or scrap (هدر). */
  block_type?: "block" | "separator" | "head" | "scrap";
  remnant_of_lot_id?: string;
  record_version: number;
  inventory_item?: InventoryItem;
  warehouse?: { id: string; name: string };
  created_at: string;
}

export interface InventoryValuation {
  operating_unit_id: string;
  stock_lot_valuation: number;
  total_lots: number;
  total_valuation: number;
  currency: string;
}

export interface WarehouseStockSummaryRow {
  inventory_item_id: string;
  item_name: string;
  item_code: string;
  uom: string;
  total_quantity: number;
  avg_unit_cost: number;
  total_value: number;
  lots_count: number;
}

export interface WarehouseStockSummary {
  warehouse: { id: string; name: string };
  rows: WarehouseStockSummaryRow[];
  total_value: number;
}

export type InventoryMovementType =
  | "receipt"
  | "issue"
  | "transfer"
  | "adjustment"
  | "consumption"
  | "production_output"
  | "byproduct_yield"
  | "sale";

export interface InventoryMovement {
  id: string;
  operating_unit_id: string;
  stock_lot_id?: string | null;
  from_warehouse_id?: string | null;
  to_warehouse_id?: string | null;
  sku: string;
  movement_type: InventoryMovementType;
  quantity_delta: number;
  unit_cost: number;
  reason?: string | null;
  reference_document_type?: string | null;
  reference_id?: string | null;
  created_at: string;
}

export const inventoryApi = {
  // Inventory Items
  getItems: (params?: { category_id?: string; item_type?: string; search?: string; page?: number; per_page?: number; with_stock?: 1 }) =>
    apiClient.get<{ data: InventoryItem[]; current_page: number; last_page: number; total: number }>("/inventory-items", { params }),

  getItem: (id: string) =>
    apiClient.get<InventoryItem>(`/inventory-items/${id}`),

  createItem: (data: InventoryItemPayload) =>
    apiClient.post<InventoryItem>("/inventory-items", data),

  updateItem: (id: string, data: InventoryItemPayload) =>
    apiClient.put<InventoryItem>(`/inventory-items/${id}`, data),

  // Stock Lots
  getLots: (params?: { category_id?: string; status?: string; grade?: string; warehouse_id?: string; inventory_item_id?: string; bin_location?: string; page?: number; attrs?: Record<string, any> }) =>
    apiClient.get<{ data: StockLot[]; current_page: number; last_page: number }>("/stock-lots", { params }),

  getAvailableForCutting: (params?: { min_volume_m3?: number; grade?: string }) =>
    apiClient.get<{ data: StockLot[] }>("/stock-lots/available-for-cutting", { params }),

  getAvailableFoamBlocks: (params: {
    inventory_item_id: string;
    grade?: string;
    min_volume_m3?: number;
    per_page?: number;
  }) => apiClient.get<{ data: StockLot[]; current_page: number; last_page: number }>(
    "/stock-lots/available-foam-blocks",
    { params },
  ),


  updateLot: (id: string, data: Partial<StockLot> & { record_version: number }) =>
    apiClient.put<StockLot>(`/stock-lots/${id}`, data),

  /** Goods intake: creates the lot, the INV-06 movement and the journal. */
  intakeLot: (data: {
    inventory_item_id: string;
    warehouse_id: string;
    lot_number?: string;
    quantity: number;
    container_quantity?: number;
    container_capacity?: number;
    primary_uom?: string;
    secondary_uom?: string;
    save_as_item_default?: boolean;
    /** W4-02: the lot's shelf; omitted, the server uses the item's level row bin in that warehouse. */
    bin_location?: string | null;
    unit_cost: number;
    source: "opening_balance" | "purchase_cash" | "purchase_credit" | "import_receipt";
    purchase_order_id?: string;
    import_order_id?: string;
    /** The treasury paid from — required for a cash purchase. */
    cash_account_id?: string;
  }) =>
    apiClient.post<StockLot>("/stock-lots/intake", {
      ...data,
      purchase_order_id: data.purchase_order_id ?? data.import_order_id,
    }),

  processCutRemnant: (
    id: string,
    data: {
      remnant_action: "restock_remnant" | "convert_to_byproduct";
      remnant_dimensions?: { length_m: number; width_m: number; height_m: number };
      byproduct_weight_kg?: number;
    }
  ) => apiClient.post<{ parent_lot: StockLot; remnant_lot?: StockLot }>(`/stock-lots/${id}/process-cut-remnant`, data),

  // Valuation
  getValuation: () =>
    apiClient.get<InventoryValuation>("/inventory/valuation"),

  // Warehouse drill-down
  getWarehouseStockSummary: (warehouseId: string) =>
    apiClient.get<WarehouseStockSummary>(`/warehouses/${warehouseId}/stock-summary`),

  getWarehouseLedger: (warehouseId: string, params?: { sku?: string; per_page?: number; page?: number }) =>
    apiClient.get<{ data: InventoryMovement[]; current_page: number; last_page: number }>(
      `/inventory/ledger/${warehouseId}`,
      { params },
    ),

  /** Every movement generated by one source document — e.g. a completed WarehouseTransfer. */
  getMovementsForDocument: (type: string, id: string) =>
    apiClient.get<InventoryMovement[]>(`/inventory-movements/for-document/${type}/${id}`),
};
