import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBankReconciliations,
  getBankReconciliation,
  createBankReconciliation,
  toggleReconciliationLines,
  finishBankReconciliation,
  discardBankReconciliation,
  type CreateBankReconciliationPayload,
  type ToggleReconciliationLinesPayload,
  type BankReconciliationDetail,
} from "../api/endpoints/bankReconciliations";

export function useBankReconciliations(cashAccountId?: string) {
  return useQuery({
    queryKey: ["bankReconciliations", cashAccountId],
    queryFn: () => getBankReconciliations(cashAccountId),
    enabled: Boolean(cashAccountId),
  });
}

export function useBankReconciliation(id: string | null) {
  return useQuery({
    queryKey: ["bankReconciliation", id],
    queryFn: () => getBankReconciliation(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBankReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBankReconciliationPayload) => createBankReconciliation(payload),
    onSuccess: (data: BankReconciliationDetail) => {
      qc.setQueryData(["bankReconciliation", data.reconciliation.id], data);
      qc.invalidateQueries({ queryKey: ["bankReconciliations"] });
    },
  });
}

export function useToggleReconciliationLines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ToggleReconciliationLinesPayload }) =>
      toggleReconciliationLines(id, payload),
    onSuccess: (data: BankReconciliationDetail, variables) => {
      qc.setQueryData(["bankReconciliation", variables.id], data);
    },
  });
}

export function useFinishBankReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => finishBankReconciliation(id),
    onSuccess: (data: BankReconciliationDetail, id: string) => {
      qc.setQueryData(["bankReconciliation", id], data);
      qc.invalidateQueries({ queryKey: ["bankReconciliations"] });
    },
  });
}

export function useDiscardBankReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discardBankReconciliation(id),
    onSuccess: (_data: void, id: string) => {
      qc.removeQueries({ queryKey: ["bankReconciliation", id] });
      qc.invalidateQueries({ queryKey: ["bankReconciliations"] });
    },
  });
}
