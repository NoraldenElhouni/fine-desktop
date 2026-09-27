import apiClient from "../client";
import { StockLot } from "./inventory";

export type CutterWorkOrderStatus =
  | "requested"
  | "confirmed"
  | "in_production"
  | "awaiting_byproduct_weigh_in"
  | "quality_check"
  | "completed"
  | "invoiced";

/** Phase 05 §5.4 — linear, one step at a time, no way back. */
export const CUTTER_STATUS_ORDER: CutterWorkOrderStatus[] = [
  "requested",
  "confirmed",
  "in_production",
  "awaiting_byproduct_weigh_in",
  "quality_check",
  "completed",
  "invoiced",
];

export const CUTTER_NEXT_STATUS: Record<CutterWorkOrderStatus, CutterWorkOrderStatus | null> = {
  requested: "confirmed",
  confirmed: "in_production",
  in_production: "awaiting_byproduct_weigh_in",
  awaiting_byproduct_weigh_in: "quality_check",
  quality_check: "completed",
  completed: "invoiced",
  invoiced: null,
};

export const CUTTER_STATUS_LABEL: Record<CutterWorkOrderStatus, string> = {
  requested: "مطلوب",
  confirmed: "مؤكد",
  in_production: "قيد الإنتاج",
  awaiting_byproduct_weigh_in: "بانتظار وزن الفائض",
  quality_check: "فحص الجودة",
  completed: "مكتمل",
  invoiced: "تم إصدار الفاتورة",
};

/** Blocks may only be picked while the order is confirmed or being cut. */
export const BLOCK_SELECTION_STATES: CutterWorkOrderStatus[] = ["confirmed", "in_production"];

export interface FoamBlockConsumption {
  id: string;
  stock_lot_id: string;
  block_volume_m3: number;
  volume_consumed_m3: number;
  consumption_type: "full" | "partial";
  consumed_cost: number;
  remainder_cost: number;
  stock_lot?: StockLot;
}

/**
 * A foam block available to be attached to a cutter work order at
 * creation time. Mirrors the backend's GET /cutter-work-orders/available-foam-blocks.
 */
export interface AvailableFoamBlock {
  id: string;
  lot_number: string;
  unit_cost: number;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  volume_m3?: number | null;
  status: string;
  warehouse?: { id: string; name: string };
  inventory_item?: { id: string; name: string; code: string };
}

export interface CutterWorkOrderLine {
  id: string;
  cutter_work_order_id: string;
  /** The client's words. Never used for costing. */
  requested_spec: string;
  quantity: number;
  /** The bounding box actually cut — what costing and inventory use. */
  template_length_m?: number;
  template_width_m?: number;
  template_height_m?: number;
  template_volume_m3?: number;
  output_inventory_item_id?: string;
  output_item?: { id: string; name: string; code: string };
  consumptions?: FoamBlockConsumption[];
  /** Set when this line cuts a sold bundle's piece rather than one the cutter added itself. */
  sale_bundle_component_id?: string | null;
  sale_component?: {
    line?: {
      description?: string | null;
      sales_order?: { id: string; order_number: string; client_id?: string | null };
    };
  } | null;
}

/** One foam block attached to a cutter order — an order may cut several. */
export interface CutterWorkOrderBlock {
  id: string;
  stock_lot_id: string;
  unit_cost_snapshot: number;
  length_m_snapshot?: number | null;
  width_m_snapshot?: number | null;
  height_m_snapshot?: number | null;
  volume_m3_snapshot?: number | null;
  stock_lot?: AvailableFoamBlock | null;
}

export interface CutterJobSheet {
  order_number: string;
  status: CutterWorkOrderStatus;
  date?: string | null;
  cutter?: string | null;
  notes?: string | null;
  blocks: { lot_number?: string | null; length_m?: number | null; width_m?: number | null; height_m?: number | null }[];
  lines: {
    requested_spec: string;
    quantity: number;
    length_m?: number | null;
    width_m?: number | null;
    height_m?: number | null;
    output_item?: string | null;
    output_sku?: string | null;
    sale_number?: string | null;
    bundle?: string | null;
    client?: string | null;
  }[];
}

export interface ByproductYield {
  id: string;
  weight_kg: number;
  yield_cost: number;
  weighed_at: string;
  stock_lot?: StockLot;
  weighed_by?: { name: string };
}

export interface CutterWorkOrder {
  id: string;
  operating_unit_id: string;
  client_id?: string;
  client?: { id: string; name?: string };
  order_number: string;
  status: CutterWorkOrderStatus;
  /** Material held in the order between block consumption and completion. */
  wip_cost: number;
  notes?: string;
  lines?: CutterWorkOrderLine[];
  lines_count?: number;
  byproduct_yields?: ByproductYield[];
  record_version: number;
  created_at: string;
  /** The foam blocks reserved for this order — several may be attached. */
  blocks?: CutterWorkOrderBlock[];
}

export const cutterApi = {
  getOrders: (params?: { status?: string; internal_only?: boolean; page?: number }) =>
    apiClient.get<{ data: CutterWorkOrder[]; current_page: number; last_page: number; total: number }>(
      "/cutter-work-orders",
      { params },
    ),

  getOrder: (id: string) => apiClient.get<CutterWorkOrder>(`/cutter-work-orders/${id}`),

  /** order_number is optional — the server numbers the order (CWO-2026-00001) when omitted. */
  createOrder: (data: {
    order_number?: string;
    client_id?: string;
    notes?: string;
    stock_lot_id?: string;
  }) => apiClient.post<CutterWorkOrder>("/cutter-work-orders", data),

  getAvailableFoamBlocks: (params?: { page?: number }) =>
    apiClient.get<{
      data: AvailableFoamBlock[];
      current_page: number;
      last_page: number;
      total: number;
    }>("/cutter-work-orders/available-foam-blocks", { params }),

  transition: (id: string, status: CutterWorkOrderStatus) =>
    apiClient.post<CutterWorkOrder>(`/cutter-work-orders/${id}/transition`, { status }),

  addLine: (
    id: string,
    data: { requested_spec: string; quantity: number; output_inventory_item_id?: string },
  ) => apiClient.post<CutterWorkOrderLine>(`/cutter-work-orders/${id}/lines`, data),

  assignTemplate: (
    lineId: string,
    data: {
      template_length_m: number;
      template_width_m: number;
      template_height_m: number;
      output_inventory_item_id?: string;
    },
  ) => apiClient.put<CutterWorkOrderLine>(`/cutter-work-order-lines/${lineId}/assign-template`, data),

  /** Filtered candidates only — the manager picks (CUT-02). */
  availableBlocks: (lineId: string) =>
    apiClient.get<{ data: StockLot[]; total: number }>(
      `/cutter-work-order-lines/${lineId}/available-blocks`,
    ),

  selectBlock: (lineId: string, stockLotId: string) =>
    apiClient.post<FoamBlockConsumption>(`/cutter-work-order-lines/${lineId}/select-block`, {
      stock_lot_id: stockLotId,
    }),

  attachBlock: (id: string, stockLotId: string) =>
    apiClient.post<CutterWorkOrder>(`/cutter-work-orders/${id}/attach-block`, {
      stock_lot_id: stockLotId,
    }),

  /** Releases the one attached block, or a named one when several are attached. */
  detachBlock: (id: string, stockLotId?: string) =>
    apiClient.delete<CutterWorkOrder>(`/cutter-work-orders/${id}/detach-block`, {
      data: stockLotId ? { stock_lot_id: stockLotId } : undefined,
    }),

  jobSheet: (id: string) => apiClient.get<CutterJobSheet>(`/cutter-work-orders/${id}/job-sheet`),

  recordWeighIn: (
    id: string,
    data: { weight_kg: number; byproduct_inventory_item_id?: string; warehouse_id?: string },
  ) => apiClient.post<ByproductYield>(`/cutter-work-orders/${id}/weigh-in`, data),

  byproductYields: (id: string) =>
    apiClient.get<ByproductYield[]>(`/cutter-work-orders/${id}/byproduct-yields`),
};
