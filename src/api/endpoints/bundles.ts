import apiClient from "../client";
import { InventoryItem } from "./inventory";

export interface BundleItem {
  id: string;
  bundle_id: string;
  inventory_item_id: string;
  /** A pre-fill hint only, always editable at sale time — never enforced. */
  suggested_quantity?: number | null;
  inventory_item?: InventoryItem;
}

export interface Bundle {
  id: string;
  /** null = shared across every operating unit; set = specific to one unit. */
  operating_unit_id?: string | null;
  name: string;
  description?: string | null;
  items: BundleItem[];
  created_at: string;
}

export interface BundleSalesRow {
  bundle_id: string;
  bundle_name: string;
  orders_count: number;
  total_quantity: number;
  total_revenue: number;
}

export interface BundleSalesReport {
  from: string | null;
  to: string | null;
  rows: BundleSalesRow[];
  total_revenue: number;
}

export interface BundleItemInput {
  inventory_item_id: string;
  suggested_quantity?: number | null;
}

export const bundlesApi = {
  getBundles: (params?: { search?: string }) =>
    apiClient.get<Bundle[]>("/bundles", { params }),

  getBundle: (id: string) => apiClient.get<Bundle>(`/bundles/${id}`),

  createBundle: (data: { name: string; description?: string | null; items: BundleItemInput[] }) =>
    apiClient.post<Bundle>("/bundles", data),

  updateBundle: (id: string, data: { name: string; description?: string | null; items: BundleItemInput[] }) =>
    apiClient.put<Bundle>(`/bundles/${id}`, data),

  deleteBundle: (id: string) => apiClient.delete(`/bundles/${id}`),

  getSalesReport: (params?: { from?: string; to?: string; company_wide?: boolean; operating_unit_id?: string }) =>
    apiClient.get<BundleSalesReport>("/reports/bundle-sales", { params }),
};
