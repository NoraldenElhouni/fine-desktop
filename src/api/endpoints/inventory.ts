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
  sku: string;
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
  created_at: string;
  updated_at: string;
}

export interface StockLot {
  id: string;
  inventory_item_id: string;
  warehouse_id: string;
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

export const inventoryApi = {
  // Inventory Items
  getItems: (params?: { category_id?: string; item_type?: string; search?: string; page?: number }) =>
    apiClient.get<{ data: InventoryItem[]; current_page: number; last_page: number; total: number }>("/inventory-items", { params }),

  createItem: (data: Partial<InventoryItem>) =>
    apiClient.post<InventoryItem>("/inventory-items", data),

  updateItem: (id: string, data: Partial<InventoryItem>) =>
    apiClient.put<InventoryItem>(`/inventory-items/${id}`, data),

  // Stock Lots
  getLots: (params?: { category_id?: string; status?: string; grade?: string; warehouse_id?: string; inventory_item_id?: string; page?: number; attrs?: Record<string, any> }) =>
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

  createLot: (data: Partial<StockLot>) =>
    apiClient.post<StockLot>("/stock-lots", data),

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
    unit_cost: number;
    source: "opening_balance" | "purchase_cash" | "purchase_credit" | "import_receipt";
    import_order_id?: string;
  }) => apiClient.post<StockLot>("/stock-lots/intake", data),

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
};
