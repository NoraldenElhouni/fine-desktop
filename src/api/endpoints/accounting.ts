import apiClient from "../client";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  asset: "أصول",
  liability: "التزامات",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export type AccountStatus = "active" | "frozen";

export interface Account {
  id: string;
  account_code: string;
  name: string;
  type: AccountType;
  currency: string;
  /** ACC-14: a frozen account keeps its history but takes no new postings or links. */
  status?: AccountStatus;
  parent_account_id: string | null;
  is_main: boolean;
  total_debit: number;
  total_credit: number;
  balance: number;
  direct_debit?: number;
  direct_credit?: number;
  direct_balance?: number;
  has_children?: boolean;
}

export interface AccountDetails extends Account {
  parent?: {
    id: string;
    account_code: string;
    name: string;
    type: AccountType;
  } | null;
  direct_transaction_count?: number;
  transaction_count?: number;
  created_at?: string;
}

export interface AccountLedgerParams {
  page?: number;
  from?: string;
  to?: string;
  search?: string;
  company_wide?: boolean;
  include_children?: boolean;
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

/** What produced an entry (ACC-13): business events, accountants, the year-end close, or a reversal. */
export type JournalEntryType = "automatic" | "manual" | "adjustment" | "opening" | "closing" | "reversal";

export const JOURNAL_ENTRY_TYPE_LABEL: Record<JournalEntryType, string> = {
  automatic: "تلقائي",
  manual: "يدوي",
  adjustment: "تسوية",
  opening: "افتتاحي",
  closing: "إقفال",
  reversal: "عكسي",
};

/** Types an accountant may post by hand. */
export const MANUAL_ENTRY_TYPES: JournalEntryType[] = ["manual", "adjustment", "opening"];

export interface JournalEntry {
  id: string;
  reference: string;
  entry_date: string;
  description: string;
  source_document_type: string | null;
  source_document_id: string | null;
  is_manual: boolean;
  entry_type: JournalEntryType;
  reversal_of_id: string | null;
  reversal_reason: string | null;
  /** The entry that reversed this one. */
  reversal?: { id: string; reference: string } | null;
  /** The entry this one reverses. */
  reversal_of?: { id: string; reference: string } | null;
  created_by?: { id: string; name: string } | null;
  lines?: JournalLine[];
  created_at: string;
}

export interface JournalEntryFilters {
  from?: string;
  to?: string;
  manual_only?: boolean;
  entry_type?: JournalEntryType[];
  account_id?: string;
  search?: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface TrialBalanceRow {
  account_id: string;
  account_code: string;
  name: string;
  type: AccountType;
  level: number;
  parent_account_id: string | null;
  is_leaf: boolean;
  has_direct_lines: boolean;
  opening_debit: number;
  opening_credit: number;
  opening_balance: number;
  period_debit: number;
  period_credit: number;
  closing_debit: number;
  closing_credit: number;
  closing_balance: number;
  /** Legacy: movement debit/credit and closing balance. */
  debit: number;
  credit: number;
  balance: number;
}

export type TrialBalanceView = "leaf" | "level" | "tree";

export interface TrialBalanceParams {
  from?: string;
  to?: string;
  include_zero?: boolean;
  view?: TrialBalanceView;
  level?: number;
  exclude_closing?: boolean;
  operating_unit_id?: string;
}

export interface TrialBalance {
  from: string | null;
  to: string | null;
  view: TrialBalanceView;
  level: number | null;
  rows: TrialBalanceRow[];
  totals: {
    opening_debit: number;
    opening_credit: number;
    period_debit: number;
    period_credit: number;
    closing_debit: number;
    closing_credit: number;
  };
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
  entry_type?: JournalEntryType;
  description: string;
  entry_date?: string;
  lines: {
    account_code: string;
    debit?: number;
    credit?: number;
    operating_unit_id?: string | null;
    client_id?: string | null;
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

export interface UpdateAccountPayload {
  name?: string;
  account_code?: string;
  currency?: string;
  /**
   * When set and differs from the current parent, the edit dialog also fires
   * PATCH /api/v1/accounts/{id}/parent after the PUT (via useSaveAccountEdits).
   */
  parent_account_id?: string;
}

/**
 * The desktop shell always pins a unit context, so accounting reads from a
 * company-wide role pass company_wide=1 to see the whole ledger. The backend
 * ignores the flag for unit-scoped users.
 */
export const accountingApi = {
  getAccounts: () =>
    apiClient.get<{ data: Account[]; meta?: { count: number } }>("/accounts"),

  getAccount: (id: string, companyWide = false) =>
    apiClient.get<{ data: AccountDetails }>(`/accounts/${id}`, {
      params: { company_wide: companyWide || undefined },
    }),

  createAccount: (payload: CreateAccountPayload) =>
    apiClient.post<{ message: string; data: Account }>("/accounts", payload),

  updateAccount: (id: string, payload: UpdateAccountPayload) =>
    apiClient.put<{ message: string; data: Account }>(`/accounts/${id}`, payload),

  reparentAccount: (id: string, parentAccountId: string) =>
    apiClient.patch<{ message: string; data: AccountDetails }>(
      `/accounts/${id}/parent`,
      { parent_account_id: parentAccountId },
    ),

  deleteAccount: (id: string) =>
    apiClient.delete<{ message: string }>(`/accounts/${id}`),

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
        include_children: params?.include_children ? 1 : undefined,
      },
    }),

  getJournalEntries: (params?: JournalEntryFilters & { page?: number; company_wide?: boolean }) =>
    apiClient.get<Paginated<JournalEntry>>("/journal-entries", { params }),

  /** ACC-14: freeze or reactivate an account. */
  updateAccountStatus: (id: string, status: AccountStatus) =>
    apiClient.patch<{ data: { id: string; status: AccountStatus } }>(`/accounts/${id}/status`, { status }),

  /** ACC-13: post the linked mirror of a posted entry. */
  reverseEntry: (id: string, payload: { entry_date?: string; reason: string }) =>
    apiClient.post<JournalEntry>(`/journal-entries/${id}/reverse`, payload),

  getJournalEntry: (id: string) => apiClient.get<JournalEntry>(`/journal-entries/${id}`),

  createManualEntry: (payload: ManualJournalPayload) =>
    apiClient.post<JournalEntry>("/journal-entries", payload),

  getTrialBalance: (params?: TrialBalanceParams & { company_wide?: boolean }) =>
    apiClient.get<TrialBalance>("/reports/trial-balance", { params }),

  getIncomeStatement: (params?: { from?: string; to?: string; company_wide?: boolean }) =>
    apiClient.get<IncomeStatement>("/reports/income-statement", { params }),

  getBalanceSheet: (params?: { as_of?: string; company_wide?: boolean }) =>
    apiClient.get<BalanceSheet>("/reports/balance-sheet", { params }),

  getUnitProfitability: (params?: { from?: string; to?: string; company_wide?: boolean }) =>
    apiClient.get<UnitProfitability>("/reports/unit-profitability", { params }),
};
