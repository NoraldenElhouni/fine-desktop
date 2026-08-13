import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { overheadApi, type AllocatePayload } from "../api/endpoints/overhead";
import { useIsCompanyWide } from "./useAccounting";

export function useOverheadExpenses(params?: { status?: string; category?: string; page?: number }) {
  const companyWide = useIsCompanyWide();
  return useQuery({
    queryKey: ["overheadExpenses", params, companyWide],
    queryFn: async () =>
      (await overheadApi.getExpenses({ ...params, company_wide: companyWide || undefined })).data,
  });
}

export function useCreateOverheadExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: overheadApi.createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overheadExpenses"] });
      qc.invalidateQueries({ queryKey: ["journalEntries"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useAllocateOverhead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AllocatePayload }) =>
      overheadApi.allocate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overheadExpenses"] });
      qc.invalidateQueries({ queryKey: ["journalEntries"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
      qc.invalidateQueries({ queryKey: ["unitProfitability"] });
    },
  });
}

export function useOverheadRules() {
  return useQuery({
    queryKey: ["overheadRules"],
    queryFn: async () => (await overheadApi.getRules()).data.data,
  });
}

export function useStoreOverheadRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: overheadApi.storeRule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["overheadRules"] }),
  });
}
