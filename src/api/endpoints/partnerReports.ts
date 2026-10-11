import apiClient from "../client";

export interface PartnerAging {
  current: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
}

export interface PartnerBalanceRow {
  id: string;
  name: string;
  phone?: string;
  contact?: string;
  city?: string;
  address?: string;
  operating_unit_id: string;
  operating_unit_name: string;
  credit_limit?: number;
  payment_terms_days?: number;
  default_currency?: string;
  total_debit?: number;
  total_credit?: number;
  total_purchases?: number;
  total_payments?: number;
  net_balance: number;
  balance_type: "debit" | "credit" | "settled";
  aging: PartnerAging;
  overdue_amount: number;
  status?: string;
}

export interface PartnerBalancesSummary {
  total_receivables?: number;
  total_payables?: number;
  total_credits_or_advances?: number;
  total_advances?: number;
  net_exposure: number;
  overdue_total: number;
  total_count: number;
}

export interface PartnerBalancesResponse {
  type: "clients" | "suppliers";
  as_of: string;
  operating_unit_id?: string | null;
  summary: PartnerBalancesSummary;
  rows: PartnerBalanceRow[];
}

export interface PartnerStatementTransaction {
  id: string;
  date: string;
  document_type: string;
  document_type_label: string;
  document_number: string;
  memo: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface PartnerStatementParty {
  id: string;
  name: string;
  phone?: string;
  contact?: string;
  address?: string;
  type: "client" | "supplier";
  currency: string;
  operating_unit_id: string;
  operating_unit_name: string;
  credit_limit?: number;
}

export interface PartnerStatementResponse {
  party: PartnerStatementParty;
  period: {
    from: string | null;
    to: string | null;
  };
  opening_balance: number;
  closing_balance: number;
  total_debit: number;
  total_credit: number;
  net_change: number;
  transactions: PartnerStatementTransaction[];
}

/** Laravel's `boolean` rule rejects "true"/"false", so booleans go over the wire as 1/0. */
const flag = (value: boolean | undefined): 0 | 1 | undefined =>
  value === undefined ? undefined : value ? 1 : 0;

export const partnerReportsApi = {
  getBalances: (
    type: "clients" | "suppliers",
    params?: { as_of?: string; operating_unit_id?: string; company_wide?: boolean }
  ) =>
    apiClient.get<PartnerBalancesResponse>("/reports/partner-balances", {
      params: {
        type,
        as_of: params?.as_of || undefined,
        operating_unit_id: params?.operating_unit_id || undefined,
        company_wide: flag(params?.company_wide),
      },
    }),

  getStatement: (
    partyType: "client" | "supplier",
    partyId: string,
    params?: { from?: string; to?: string; operating_unit_id?: string; company_wide?: boolean }
  ) =>
    apiClient.get<PartnerStatementResponse>("/reports/partner-statement", {
      params: {
        party_type: partyType,
        party_id: partyId,
        from: params?.from || undefined,
        to: params?.to || undefined,
        operating_unit_id: params?.operating_unit_id || undefined,
        company_wide: flag(params?.company_wide),
      },
    }),
};
