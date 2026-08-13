import apiClient from "../client";
import type { Paginated } from "./accounting";

export type DepreciationMethod = "straight_line" | "declining_balance";
export type FixedAssetStatus = "active" | "under_maintenance" | "disposed";

export const DEPRECIATION_METHOD_LABEL: Record<DepreciationMethod, string> = {
  straight_line: "قسط ثابت",
  declining_balance: "قسط متناقص",
};

export const ASSET_STATUS_LABEL: Record<FixedAssetStatus, string> = {
  active: "نشط",
  under_maintenance: "قيد الصيانة",
  disposed: "مُستبعد",
};

export interface DepreciationEntry {
  id: string;
  period: string;
  amount: string;
  book_value_after: string;
}

export interface FixedAsset {
  id: string;
  operating_unit_id: string | null;
  name: string;
  asset_code: string;
  acquisition_cost: string;
  acquisition_date: string;
  depreciation_method: DepreciationMethod;
  useful_life_years: number;
  salvage_value: string;
  accumulated_depreciation: string;
  status: FixedAssetStatus;
  disposal_proceeds: string | null;
  disposed_at: string | null;
  operating_unit?: { id: string; name: string } | null;
  depreciation_entries?: DepreciationEntry[];
}

export interface ScheduleRow {
  period: string;
  amount: number;
  book_value_after: number;
}

export interface CreateAssetPayload {
  name: string;
  asset_code: string;
  acquisition_cost: number;
  acquisition_date: string;
  depreciation_method: DepreciationMethod;
  useful_life_years: number;
  salvage_value?: number;
  payment_source: "cash" | "payable";
  is_company_wide?: boolean;
  operating_unit_id?: string | null;
}

export const fixedAssetsApi = {
  list: (params?: { status?: string; page?: number; company_wide?: boolean }) =>
    apiClient.get<Paginated<FixedAsset>>("/fixed-assets", { params }),

  get: (id: string) => apiClient.get<FixedAsset>(`/fixed-assets/${id}`),

  create: (payload: CreateAssetPayload) => apiClient.post<FixedAsset>("/fixed-assets", payload),

  depreciate: (id: string, period?: string) =>
    apiClient.post<{ message: string; data: DepreciationEntry; asset: FixedAsset }>(
      `/fixed-assets/${id}/depreciate`,
      period ? { period } : {},
    ),

  dispose: (id: string, proceeds: number) =>
    apiClient.post<{ message: string; data: FixedAsset }>(`/fixed-assets/${id}/dispose`, { proceeds }),

  transition: (id: string, status: "active" | "under_maintenance") =>
    apiClient.post<{ message: string; data: FixedAsset }>(`/fixed-assets/${id}/transition`, { status }),

  schedule: (id: string) =>
    apiClient.get<{ asset_id: string; book_value: number; rows: ScheduleRow[] }>(
      `/fixed-assets/${id}/depreciation-schedule`,
    ),
};
