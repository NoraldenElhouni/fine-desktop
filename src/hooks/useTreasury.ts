import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFxRates,
  createFxRate,
  getPayableOutstanding,
  getPayableSettlements,
  settlePayable,
  getCashAccounts,
  createCashAccount,
  updateCashAccount,
} from "../api/endpoints/procurement";
import {
  CreateFxRatePayload,
  CreateCashAccountPayload,
  UpdateCashAccountPayload,
} from "../types/procurement";

export function useFxRates() {
  return useQuery({
    queryKey: ["fxRates"],
    queryFn: () => getFxRates(),
  });
}

export function useCreateFxRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFxRatePayload) => createFxRate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fxRates"] });
    },
  });
}

export function usePayableOutstanding() {
  return useQuery({
    queryKey: ["payableOutstanding"],
    queryFn: () => getPayableOutstanding(),
  });
}

export function usePayableSettlements() {
  return useQuery({
    queryKey: ["payableSettlements"],
    queryFn: () => getPayableSettlements(),
  });
}

export function useSettlePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      account_code: string;
      amount: number;
      reference?: string;
    }) => settlePayable(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payableOutstanding"] });
      qc.invalidateQueries({ queryKey: ["payableSettlements"] });
      qc.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });
}

export function useCashAccounts(operatingUnitId?: string) {
  return useQuery({
    queryKey: ["cashAccounts", operatingUnitId],
    queryFn: () => getCashAccounts(operatingUnitId),
  });
}

export function useUpdateCashAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCashAccountPayload }) =>
      updateCashAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
    },
  });
}

export function useCreateCashAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashAccountPayload) => createCashAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
    },
  });
}
