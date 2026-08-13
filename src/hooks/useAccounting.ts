import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "../api/endpoints/accounting";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await accountingApi.getAccounts()).data.data,
  });
}

export function useAccountLedger(accountId?: string, page = 1) {
  return useQuery({
    queryKey: ["accountLedger", accountId, page],
    queryFn: async () => (await accountingApi.getAccountLedger(accountId as string, page)).data,
    enabled: Boolean(accountId),
  });
}

export function useJournalEntries(params?: {
  from?: string;
  to?: string;
  manual_only?: boolean;
  page?: number;
}) {
  return useQuery({
    queryKey: ["journalEntries", params],
    queryFn: async () => (await accountingApi.getJournalEntries(params)).data,
  });
}

export function useJournalEntry(id?: string) {
  return useQuery({
    queryKey: ["journalEntry", id],
    queryFn: async () => (await accountingApi.getJournalEntry(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCreateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountingApi.createManualEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journalEntries"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useTrialBalance(operatingUnitId?: string) {
  return useQuery({
    queryKey: ["trialBalance", operatingUnitId],
    queryFn: async () =>
      (await accountingApi.getTrialBalance(
        operatingUnitId ? { operating_unit_id: operatingUnitId } : undefined,
      )).data,
  });
}

export function useIncomeStatement(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["incomeStatement", params],
    queryFn: async () => (await accountingApi.getIncomeStatement(params)).data,
  });
}

export function useBalanceSheet(asOf?: string) {
  return useQuery({
    queryKey: ["balanceSheet", asOf],
    queryFn: async () => (await accountingApi.getBalanceSheet(asOf ? { as_of: asOf } : undefined)).data,
  });
}

export function useUnitProfitability(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["unitProfitability", params],
    queryFn: async () => (await accountingApi.getUnitProfitability(params)).data,
  });
}
