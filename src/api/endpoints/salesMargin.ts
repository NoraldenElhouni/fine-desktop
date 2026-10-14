import apiClient from "../client";

export type SalesMarginGroupBy = "item" | "category" | "client" | "sale";

export interface SalesMarginRow {
  key: string;
  label: string;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: number | null;
}

export interface SalesMarginTotals {
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: number | null;
}

export interface SalesMarginResponse {
  from: string | null;
  to: string | null;
  group_by: SalesMarginGroupBy;
  rows: SalesMarginRow[];
  totals: SalesMarginTotals;
  lines_missing_cost: number;
}

export interface SalesMarginParams {
  from?: string;
  to?: string;
  group_by?: SalesMarginGroupBy;
  operating_unit_id?: string;
  company_wide?: boolean;
}

/** Laravel's `boolean` rule rejects "true"/"false", so booleans go over the wire as 1/0. */
const flag = (value: boolean | undefined): 0 | 1 | undefined =>
  value === undefined ? undefined : value ? 1 : 0;

export const salesMarginApi = {
  get: (params?: SalesMarginParams) =>
    apiClient.get<SalesMarginResponse>("/reports/sales-margin", {
      params: params
        ? {
            ...params,
            company_wide: flag(params.company_wide),
          }
        : undefined,
    }),
};
