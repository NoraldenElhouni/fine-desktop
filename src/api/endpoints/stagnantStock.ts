import apiClient from "../client";

/** Lot statuses the report counts (lots that still hold stock in a warehouse). */
export type StagnantLotStatus = "available" | "reserved" | "quarantined";

/**
 * One lot of GET /inventory/stagnant-stock (W4-04): it holds stock and its last
 * real movement (transfers and reservation splits don't count) is older than
 * the cutoff. Value is the lot's own quantity × unit cost.
 */
export interface StagnantStockRow {
  stock_lot_id: string;
  lot_number: string;
  inventory_item_id: string;
  item_code: string | null;
  item_name: string | null;
  unit_of_measure: string | null;
  category_id: string | null;
  warehouse_id: string;
  warehouse_name: string | null;
  operating_unit_id: string | null;
  bin_location: string | null;
  status: StagnantLotStatus;
  quantity: number;
  unit_cost: number;
  value: number;
  received_at: string | null;
  /**
   * Newest real movement on this lot; null when it has none. Then idle_since is
   * received_at/created_at — for a split lot (-XFER, -R) that is the parent's
   * idle-since copied at split time, not a receipt date.
   */
  last_movement_at: string | null;
  idle_since: string;
  days_idle: number;
}

export interface StagnantStockReport {
  rows: StagnantStockRow[];
  summary: { days: number; cutoff: string; lots: number; total_value: number };
}

export interface StagnantStockFilters {
  /** 1–3650; the server defaults to 90. */
  days?: number;
  warehouse_id?: string;
  category_id?: string;
}

/** The server's default and bounds for `days`. */
export const STAGNANT_DEFAULT_DAYS = 90;
export const STAGNANT_MAX_DAYS = 3650;

export const stagnantStockApi = {
  report: (params?: StagnantStockFilters) =>
    apiClient.get<StagnantStockReport>("/inventory/stagnant-stock", { params }),
};
