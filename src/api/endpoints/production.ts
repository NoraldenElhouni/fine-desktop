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

export interface ConsumptionLineInput {
  chemical_inventory_item_id: string;
  quantity_consumed: number;
}

export interface ConsumptionLine {
  id: string;
  chemical_inventory_item_id: string;
  quantity_consumed: number;
  unit_cost_at_consumption: number;
  chemical_item?: { id: string; name: string; sku: string };
}

export interface ConsumptionReport {
  id: string;
  production_batch_id: string;
  reported_at: string;
  lines: ConsumptionLine[];
}

/** The machine's physical pour width (FOAM-01). */
export const MAX_BUN_WIDTH_M = 2.4;

export const productionApi = {
  transition: (id: string, status: ProductionBatchStatus) =>
    apiClient.post<ProductionBatch>(`/production-batches/${id}/transition`, { status }),

  getConsumptionReport: (batchId: string) =>
    apiClient.get<{ report: ConsumptionReport; material_cost: number }>(
      `/production-batches/${batchId}/consumption-report`,
    ),

  recordConsumption: (batchId: string, lines: ConsumptionLineInput[]) =>
    apiClient.post<{ report: ConsumptionReport; material_cost: number; batch: ProductionBatch }>(
      `/production-batches/${batchId}/consumption-report`,
      { lines },
    ),

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
