import apiClient from "../client";

export type DebtorClientStatus = "active" | "suspended" | "blacklisted";

export interface DebtorAging {
  current: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
}

export interface DebtorLine {
  date: string;
  reference: string;
  description: string | null;
  source_type: string | null;
  source_id: string | null;
  journal_entry_id: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface DebtorClient {
  id: string;
  name: string;
  /** Empty string when the client has no contact phone. */
  phone: string;
  /** Empty string when the client has no contact city. */
  city: string;
  status: DebtorClientStatus;
  credit_limit: number;
  payment_terms_days: number;
}

export interface DebtorSection {
  opening_balance: number;
  lines: DebtorLine[];
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  aging: DebtorAging;
  overdue_amount: number;
}

export interface DebtorStatement extends DebtorSection {
  client: DebtorClient;
}

export interface DebtorStatementsTotals {
  opening: number;
  debit: number;
  credit: number;
  closing: number;
  debtors_count: number;
  aging: DebtorAging;
  overdue: number;
}

export interface DebtorStatementsResponse {
  period: { from: string; to: string };
  generated_at: string;
  debtors: DebtorStatement[];
  unassigned: DebtorSection | null;
  totals: DebtorStatementsTotals;
}

export interface DebtorStatementParams {
  from: string;
  to: string;
  client_ids?: string[];
  statuses?: DebtorClientStatus[];
  city?: string;
  min_balance?: number;
  include_unassigned?: boolean;
  company_wide?: boolean;
}

/** Laravel's `boolean` rule rejects "true"/"false", so booleans go over the wire as 1/0. */
const flag = (value: boolean | undefined): 0 | 1 | undefined =>
  value === undefined ? undefined : value ? 1 : 0;

export const debtorStatementsApi = {
  // axios 1.x serializes arrays as client_ids[]=a&client_ids[]=b, which Laravel accepts.
  get: (params: DebtorStatementParams) =>
    apiClient.get<DebtorStatementsResponse>("/reports/debtor-statements", {
      params: {
        ...params,
        include_unassigned: flag(params.include_unassigned),
        company_wide: flag(params.company_wide),
      },
    }),
};
