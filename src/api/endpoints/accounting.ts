import apiClient from "../client";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  asset: "أصول",
  liability: "التزامات",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export interface Account {
  id: string;
  account_code: string;
  name: string;
  type: AccountType;
  currency: string;
  parent_account_id: string | null;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export interface AccountDetails extends Account {
  parent?: {
    id: string;
    account_code: string;
    name: string;
    type: AccountType;
  } | null;
  transaction_count?: number;
  created_at?: string;
}

export interface AccountLedgerParams {
  page?: number;
  from?: string;
  to?: string;
  search?: string;
  company_wide?: boolean;
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  operating_unit_id: string | null;
  debit: string;
  credit: string;
  memo: string | null;
  account?: { id: string; account_code: string; name: string; type: AccountType };
  operating_unit?: { id: string; name: string } | null;
  journal_entry?: {
    id: string;
    reference: string;
    entry_date: string;
    description: string;
    is_manual: boolean;
  };
}

export interface JournalEntry {
  id: string;
  reference: string;
  entry_date: string;
  description: string;
  source_document_type: string | null;
  source_document_id: string | null;
  is_manual: boolean;
  created_by?: { id: string; name: string } | null;
  lines?: JournalLine[];
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface TrialBalanceRow {
  account_code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  total_debit: number;
  total_credit: number;
  balanced: boolean;
}

export interface ReportRow {
  account_code: string;
  name: string;
  balance: number;
}

export interface IncomeStatement {
  from: string | null;
  to: string | null;
  revenue: { rows: ReportRow[]; total: number };
  expenses: { rows: ReportRow[]; total: number };
  net_income: number;
}

export interface BalanceSheet {
  as_of: string;
  assets: { rows: ReportRow[]; total: number };
  liabilities: { rows: ReportRow[]; total: number };
  equity: { rows: ReportRow[]; retained_current_period: number; total: number };
  balanced: boolean;
}

export interface UnitProfitabilityRow {
  operating_unit_id: string | null;
  unit_name: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface UnitProfitability {
  from: string | null;
  to: string | null;
  rows: UnitProfitabilityRow[];
  total_net: number;
}

export interface ManualJournalPayload {
  description: string;
  entry_date?: string;
  lines: {
    account_code: string;
    debit?: number;
    credit?: number;
    operating_unit_id?: string | null;
    memo?: string | null;
  }[];
}

export interface CreateAccountPayload {
  account_code: string;
  name: string;
  type: AccountType;
  parent_account_id?: string | null;
  currency?: string;
}

/**
 * The desktop shell always pins a unit context, so accounting reads from a
 * company-wide role pass company_wide=1 to see the whole ledger. The backend
 * ignores the flag for unit-scoped users.
 */
export const accountingApi = {
  getAccounts: () => apiClient.get<{ data: Account[] }>("/accounts"),

  getAccount: (id: string, companyWide = false) =>
    apiClient.get<{ data: AccountDetails }>(`/accounts/${id}`, {
      params: { company_wide: companyWide || undefined },
    }),

  createAccount: (payload: CreateAccountPayload) =>
    apiClient.post<{ message: string; data: Account }>("/accounts", payload),

  getAccountLedger: (
    accountId: string,
    params?: AccountLedgerParams
  ) =>
    apiClient.get<Paginated<JournalLine>>(`/accounts/${accountId}/ledger`, {
      params: {
        page: params?.page ?? 1,
        from: params?.from || undefined,
        to: params?.to || undefined,
        search: params?.search || undefined,
        company_wide: params?.company_wide || undefined,
      },
    }),

  getJournalEntries: (params?: {
    from?: string;
    to?: string;
    manual_only?: boolean;
    page?: number;
    company_wide?: boolean;
  }) => apiClient.get<Paginated<JournalEntry>>("/journal-entries", { params }),

  getJournalEntry: (id: string) => apiClient.get<JournalEntry>(`/journal-entries/${id}`),

  createManualEntry: (payload: ManualJournalPayload) =>
    apiClient.post<JournalEntry>("/journal-entries", payload),

  getTrialBalance: (params?: { operating_unit_id?: string; company_wide?: boolean }) =>
    apiClient.get<TrialBalance>("/reports/trial-balance", { params }),

  getIncomeStatement: (params?: { from?: string; to?: string; company_wide?: boolean }) =>
    apiClient.get<IncomeStatement>("/reports/income-statement", { params }),

  getBalanceSheet: (params?: { as_of?: string; company_wide?: boolean }) =>
    apiClient.get<BalanceSheet>("/reports/balance-sheet", { params }),

  getUnitProfitability: (params?: { from?: string; to?: string; company_wide?: boolean }) =>
    apiClient.get<UnitProfitability>("/reports/unit-profitability", { params }),
};
