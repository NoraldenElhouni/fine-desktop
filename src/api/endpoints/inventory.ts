import apiClient from "../client";
import { ItemCategory, InventoryAttributeDefinition } from "./categories";

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
  attribute_definitions?: InventoryAttributeDefinition[];
  attribute_definition_ids?: string[];
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
  remnant_of_lot_id?: string;
  record_version: number;
  inventory_item?: InventoryItem;
  warehouse?: { id: string; name: string };
  created_at: string;
}

export interface TankStock {
  id: string;
  chemical_inventory_item_id: string;
  operating_unit_id: string;
  quantity_on_hand: number;
  weighted_avg_unit_cost: number;
  record_version: number;
  chemical_item?: InventoryItem;
  created_at: string;
}

export interface StockAdjustmentRequest {
  id: string;
  operating_unit_id: string;
  stock_lot_id: string;
  reason_code: "audit_reconciliation" | "spill_loss" | "damage" | "expired";
  quantity_delta: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  requested_by_user_id: string;
  approved_by_user_id?: string;
  approved_at?: string;
  stock_lot?: StockLot;
  requested_by?: { name: string };
  created_at: string;
}

export interface InventoryValuation {
  operating_unit_id: string;
  stock_lot_valuation: number;
  total_lots: number;
  tank_stock_valuation: number;
  total_tanks: number;
  total_valuation: number;
  currency: string;
}

export const inventoryApi = {
  // Inventory Items
  getItems: (params?: { category_id?: string; item_type?: string; search?: string; page?: number }) =>
    apiClient.get<{ data: InventoryItem[]; current_page: number; last_page: number }>("/inventory-items", { params }),

  createItem: (data: Partial<InventoryItem>) =>
    apiClient.post<InventoryItem>("/inventory-items", data),

  updateItem: (id: string, data: Partial<InventoryItem>) =>
    apiClient.put<InventoryItem>(`/inventory-items/${id}`, data),

  /**
   * Pour a source lot into the tank — the balanced refill.
   *
   * Cost comes from the lot, so no cost is sent. Provide exactly one of
   * draw_quantity (measure UOM) or draw_containers (whole barrels).
   */
  refillFromLot: (data: {
    source_stock_lot_id: string;
    draw_quantity?: number;
    draw_containers?: number;
  }) => apiClient.post<{ tank: TankStock; source_lot: StockLot }>("/tank-stocks/refill-from-lot", data),

  // Stock Lots
  getLots: (params?: { category_id?: string; status?: string; grade?: string; warehouse_id?: string; inventory_item_id?: string; page?: number; attrs?: Record<string, any> }) =>
    apiClient.get<{ data: StockLot[]; current_page: number; last_page: number }>("/stock-lots", { params }),

  getAvailableForCutting: (params?: { min_volume_m3?: number; grade?: string }) =>
    apiClient.get<{ data: StockLot[] }>("/stock-lots/available-for-cutting", { params }),

  createLot: (data: Partial<StockLot>) =>
    apiClient.post<StockLot>("/stock-lots", data),

  /** Goods intake: creates the lot, the INV-06 movement and the journal. */
  intakeLot: (data: {
    inventory_item_id: string;
    warehouse_id: string;
    lot_number: string;
    quantity: number;
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

  // Tank Stocks
  getTanks: (operatingUnitId?: string) =>
    apiClient.get<TankStock[]>("/tank-stocks", { params: { operating_unit_id: operatingUnitId } }),

  refillTank: (data: {
    chemical_inventory_item_id: string;
    /** @deprecated Ignored by the server — the unit comes from the X-Operating-Unit-ID header. */
    operating_unit_id?: string;
    refill_quantity: number;
    refill_unit_cost: number;
  }) => apiClient.post<TankStock>("/tank-stocks/refill", data),

  // Adjustments
  getAdjustments: (params?: { status?: string; operating_unit_id?: string }) =>
    apiClient.get<{ data: StockAdjustmentRequest[] }>("/stock-adjustment-requests", { params }),

  createAdjustment: (data: {
    /** @deprecated Ignored by the server — the unit comes from the X-Operating-Unit-ID header. */
    operating_unit_id?: string;
    stock_lot_id: string;
    reason_code: string;
    quantity_delta: number;
    notes?: string;
  }) => apiClient.post<StockAdjustmentRequest>("/stock-adjustment-requests", data),

  approveAdjustment: (id: string) =>
    apiClient.post<StockAdjustmentRequest>(`/stock-adjustment-requests/${id}/approve`),

  rejectAdjustment: (id: string) =>
    apiClient.post<StockAdjustmentRequest>(`/stock-adjustment-requests/${id}/reject`),

  // Valuation
  getValuation: () =>
    apiClient.get<InventoryValuation>("/inventory/valuation"),
};
