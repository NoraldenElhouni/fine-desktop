import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "../api/endpoints/accounting";
import { useAuthStore } from "../stores/authStore";

interface RoleWithPivot {
  pivot?: { operating_unit_id: string | null };
}

/**
 * A role bound to no unit (owner, accounting manager) sees the whole company.
 * The desktop shell always pins a unit context, so accounting queries from
 * such users pass company_wide=1 — the backend refuses the flag for anyone
 * else.
 */
export function useIsCompanyWide(): boolean {
  const user = useAuthStore((s) => s.user) as { roles?: RoleWithPivot[] } | null;
  return Boolean(user?.roles?.some((r) => r.pivot && r.pivot.operating_unit_id === null));
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await accountingApi.getAccounts()).data.data,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountingApi.createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: import("../api/endpoints/accounting").UpdateAccountPayload }) =>
      accountingApi.updateAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingApi.deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useAccount(accountId?: string) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["account", accountId, companyWide],
    queryFn: async () =>
      (await accountingApi.getAccount(accountId as string, companyWide)).data.data,
    enabled: Boolean(accountId),
  });
}

export function useAccountLedger(
  accountId?: string,
  params?: {
    page?: number;
    from?: string;
    to?: string;
    search?: string;
  }
) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["accountLedger", accountId, params, companyWide],
    queryFn: async () =>
      (
        await accountingApi.getAccountLedger(accountId as string, {
          ...params,
          company_wide: companyWide,
        })
      ).data,
    enabled: Boolean(accountId),
  });
}

export function useJournalEntries(params?: {
  from?: string;
  to?: string;
  manual_only?: boolean;
  page?: number;
}) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["journalEntries", params, companyWide],
    queryFn: async () =>
      (await accountingApi.getJournalEntries({ ...params, company_wide: companyWide || undefined })).data,
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
      qc.invalidateQueries({ queryKey: ["accountLedger"] });
    },
  });
}

export function useTrialBalance(operatingUnitId?: string) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["trialBalance", operatingUnitId, companyWide],
    queryFn: async () =>
      (await accountingApi.getTrialBalance({
        operating_unit_id: operatingUnitId,
        company_wide: (!operatingUnitId && companyWide) || undefined,
      })).data,
  });
}

export function useIncomeStatement(params?: { from?: string; to?: string }) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["incomeStatement", params, companyWide],
    queryFn: async () =>
      (await accountingApi.getIncomeStatement({ ...params, company_wide: companyWide || undefined })).data,
  });
}

export function useBalanceSheet(asOf?: string) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["balanceSheet", asOf, companyWide],
    queryFn: async () =>
      (await accountingApi.getBalanceSheet({ as_of: asOf, company_wide: companyWide || undefined })).data,
  });
}

export function useUnitProfitability(params?: { from?: string; to?: string }) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["unitProfitability", params, companyWide],
    queryFn: async () =>
      (await accountingApi.getUnitProfitability({ ...params, company_wide: companyWide || undefined })).data,
  });
}
