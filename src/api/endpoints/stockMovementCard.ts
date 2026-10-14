import apiClient from "../client";

export interface StockMovementCardItem {
  id: string;
  name: string;
  code: string;
  unit: string | null;
}

export interface StockMovementCardRow {
  id: string;
  date: string | null;
  movement_type: string;
  group: string;
  reference_document_type: string | null;
  reference_id: string | null;
  reason: string;
  warehouse: { id: string; name: string } | null;
  in: number;
  out: number;
  balance: number;
  unit_cost: number;
}

export interface StockMovementCardTotals {
  in: number;
  out: number;
}

export interface StockMovementCardResponse {
  item: StockMovementCardItem;
  from: string | null;
  to: string | null;
  warehouse_id: string | null;
  opening_balance: number;
  rows: StockMovementCardRow[];
  totals: StockMovementCardTotals;
  closing_balance: number;
}

export interface StockMovementCardParams {
  from?: string;
  to?: string;
  warehouse_id?: string;
  operating_unit_id?: string;
  company_wide?: boolean;
}

const flag = (value: boolean | undefined): 0 | 1 | undefined =>
  value === undefined ? undefined : value ? 1 : 0;

export const stockMovementCardApi = {
  get: (itemId: string, params?: StockMovementCardParams) =>
    apiClient.get<StockMovementCardResponse>(`/inventory/items/${itemId}/movement-card`, {
      params: params
        ? {
            ...params,
            company_wide: flag(params.company_wide),
          }
        : undefined,
    }),
};
