import apiClient from "../client";
import { StockLot } from "./inventory";

export type ProductionOrderStatus =
  | "requested"
  | "bom_confirmed"
  | "in_production"
  | "quality_check"
  | "ready_for_collection"
  | "completed";

export const ORDER_STATUS_ORDER: ProductionOrderStatus[] = [
  "requested",
  "bom_confirmed",
  "in_production",
  "quality_check",
  "ready_for_collection",
  "completed",
];

export const ORDER_NEXT_STATUS: Record<ProductionOrderStatus, ProductionOrderStatus | null> = {
  requested: "bom_confirmed",
  bom_confirmed: "in_production",
  in_production: "quality_check",
  quality_check: "ready_for_collection",
  ready_for_collection: "completed",
  completed: null,
};

export const ORDER_STATUS_LABEL: Record<ProductionOrderStatus, string> = {
  requested: "Requested",
  bom_confirmed: "BOM Confirmed",
  in_production: "In Production",
  quality_check: "Quality Check",
  ready_for_collection: "Ready for Collection",
  completed: "Completed",
};

/** Late entries are allowed through QC, but not after the FG journal posts. */
export const LABOR_LOG_STATES: ProductionOrderStatus[] = ["in_production", "quality_check"];

export interface BomComponentLine {
  id: string;
  inventory_item_id: string;
  quantity: number;
  estimated_unit_cost: number;
  inventory_item?: { id: string; name: string; sku: string; item_type: string };
}

export interface LaborRequirement {
  id: string;
  role: string;
  estimated_hours: number;
  hourly_rate: number;
}

export interface Bom {
  id: string;
  product_id: string;
  version: number;
  is_active: boolean;
  cloned_from_bom_id?: string;
  notes?: string;
  component_lines?: BomComponentLine[];
  labor_requirements?: LaborRequirement[];
}

export interface Product {
  id: string;
  inventory_item_id: string;
  name: string;
  sku: string;
  description?: string;
  markup_factor: number;
  boms_count?: number;
  active_bom?: Bom | null;
  inventory_item?: { id: string; name: string; sku: string };
  record_version: number;
}

export interface PricePreview {
  estimated_material_cost: number;
  estimated_labor_cost: number;
  estimated_total_cost: number;
  markup_factor: number;
  suggested_price: number;
}

export interface LaborLog {
  id: string;
  role: string;
  hours_logged: number;
  hourly_rate_at_log: number;
  logged_at: string;
  employee?: { id: string; job_title?: string; entity?: { name?: string } };
}

export interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  bom_id: string;
  client_id?: string;
  quantity: number;
  status: ProductionOrderStatus;
  material_cost: number;
  labor_cost: number;
  notes?: string;
  product?: Product;
  bom?: Bom;
  labor_logs?: LaborLog[];
  finished_stock_lot?: StockLot | null;
  record_version: number;
  created_at: string;
}

export const furnitureApi = {
  getProducts: (params?: { search?: string; page?: number }) =>
    apiClient.get<{ data: Product[]; total: number }>("/products", { params }),

  createProduct: (data: {
    inventory_item_id: string;
    name: string;
    sku: string;
    description?: string;
    markup_factor?: number;
  }) => apiClient.post<Product>("/products", data),

  getProductBoms: (productId: string) => apiClient.get<Bom[]>(`/products/${productId}/boms`),

  createBom: (data: { product_id: string; notes?: string; activate?: boolean }) =>
    apiClient.post<Bom>("/boms", data),

  activateBom: (id: string) => apiClient.post<Bom>(`/boms/${id}/activate`),

  cloneBom: (id: string) => apiClient.post<Bom>(`/boms/${id}/clone`),

  pricePreview: (id: string) => apiClient.get<PricePreview>(`/boms/${id}/price-preview`),

  addComponentLine: (
    bomId: string,
    data: { inventory_item_id: string; quantity: number; estimated_unit_cost?: number },
  ) => apiClient.post<BomComponentLine>(`/boms/${bomId}/component-lines`, data),

  removeComponentLine: (bomId: string, lineId: string) =>
    apiClient.delete(`/boms/${bomId}/component-lines/${lineId}`),

  addLaborRequirement: (
    bomId: string,
    data: { role: string; estimated_hours: number; hourly_rate: number },
  ) => apiClient.post<LaborRequirement>(`/boms/${bomId}/labor-requirements`, data),

  removeLaborRequirement: (bomId: string, reqId: string) =>
    apiClient.delete(`/boms/${bomId}/labor-requirements/${reqId}`),

  getOrders: (params?: { status?: string; stock_only?: boolean; page?: number }) =>
    apiClient.get<{ data: ProductionOrder[]; total: number }>("/production-orders", { params }),

  getOrder: (id: string) => apiClient.get<ProductionOrder>(`/production-orders/${id}`),

  createOrder: (data: {
    order_number: string;
    product_id: string;
    bom_id?: string;
    client_id?: string;
    quantity?: number;
    notes?: string;
  }) => apiClient.post<ProductionOrder>("/production-orders", data),

  transition: (id: string, status: ProductionOrderStatus) =>
    apiClient.post<ProductionOrder>(`/production-orders/${id}/transition`, { status }),

  logLabor: (
    id: string,
    data: { employee_id: string; role: string; hours_logged: number; hourly_rate?: number },
  ) => apiClient.post<LaborLog>(`/production-orders/${id}/labor-logs`, data),
};
