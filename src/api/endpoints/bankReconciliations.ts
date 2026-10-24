import apiClient from "../client";

export type BankReconciliationStatus = "draft" | "finished";

export interface BankReconciliationAccountRef {
  id: string;
  name: string;
  currency: string;
}

export interface BankReconciliationUserRef {
  id: string;
  name: string;
}

export interface BankReconciliation {
  id: string;
  cash_account: BankReconciliationAccountRef;
  statement_date: string;
  statement_balance: number;
  status: BankReconciliationStatus;
  status_label?: string;
  notes: string | null;
  created_by: BankReconciliationUserRef;
  finished_by: BankReconciliationUserRef | null;
  finished_at: string | null;
  created_at?: string;
}

export interface BankReconciliationSummary {
  book_balance: number;
  opening_cleared_balance: number;
  cleared_debit: number;
  cleared_credit: number;
  cleared_balance: number;
  statement_balance: number;
  difference: number;
  uncleared_deposits: number;
  uncleared_payments: number;
}

export interface BankReconciliationLine {
  id: string;
  entry_date: string;
  reference: string;
  description: string;
  memo: string | null;
  debit: number;
  credit: number;
  currency: string | null;
  cleared: boolean;
}

export interface BankReconciliationItem extends BankReconciliation {
  summary?: BankReconciliationSummary;
}

export interface BankReconciliationDetail {
  reconciliation: BankReconciliation;
  summary: BankReconciliationSummary;
  lines: BankReconciliationLine[];
}

export interface CreateBankReconciliationPayload {
  cash_account_id: string;
  statement_date: string;
  statement_balance: number;
  notes?: string;
}

export interface ToggleReconciliationLinesPayload {
  line_ids: string[];
  cleared: boolean;
}

export const bankReconciliationsApi = {
  getReconciliations: async (cashAccountId?: string): Promise<BankReconciliationItem[]> => {
    const res = await apiClient.get<{ data: BankReconciliationItem[] }>("/bank-reconciliations", {
      params: cashAccountId ? { cash_account_id: cashAccountId } : undefined,
    });
    return res.data.data;
  },

  getReconciliation: async (id: string): Promise<BankReconciliationDetail> => {
    const res = await apiClient.get<{ data: BankReconciliationDetail }>(`/bank-reconciliations/${id}`);
    return res.data.data;
  },

  createReconciliation: async (
    payload: CreateBankReconciliationPayload,
  ): Promise<BankReconciliationDetail> => {
    const res = await apiClient.post<{ data: BankReconciliationDetail }>("/bank-reconciliations", payload);
    return res.data.data;
  },

  toggleLines: async (
    id: string,
    payload: ToggleReconciliationLinesPayload,
  ): Promise<BankReconciliationDetail> => {
    const res = await apiClient.post<{ data: BankReconciliationDetail }>(
      `/bank-reconciliations/${id}/lines`,
      payload,
    );
    return res.data.data;
  },

  finishReconciliation: async (id: string): Promise<BankReconciliationDetail> => {
    const res = await apiClient.post<{ data: BankReconciliationDetail }>(
      `/bank-reconciliations/${id}/finish`,
    );
    return res.data.data;
  },

  discardReconciliation: async (id: string): Promise<void> => {
    await apiClient.delete(`/bank-reconciliations/${id}`);
  },
};

export const getBankReconciliations = bankReconciliationsApi.getReconciliations;
export const getBankReconciliation = bankReconciliationsApi.getReconciliation;
export const createBankReconciliation = bankReconciliationsApi.createReconciliation;
export const toggleReconciliationLines = bankReconciliationsApi.toggleLines;
export const finishBankReconciliation = bankReconciliationsApi.finishReconciliation;
export const discardBankReconciliation = bankReconciliationsApi.discardReconciliation;
