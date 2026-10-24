import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCheques,
  getChequeSummary,
  getCheque,
  receiveCheque,
  depositCheque,
  clearCheque,
  bounceCheque,
  returnCheque,
  type ChequeFilters,
  type ReceiveChequePayload,
  type DepositChequePayload,
  type ClearChequePayload,
  type BounceChequePayload,
  type ReturnChequePayload,
} from "../api/endpoints/cheques";

const ACCOUNTING_QUERY_KEYS = [
  "journalEntries",
  "journalEntry",
  "accounts",
  "account",
  "trialBalance",
  "accountLedger",
  "incomeStatement",
  "balanceSheet",
  "unitProfitability",
] as const;

function invalidateChequeQueries(qc: ReturnType<typeof useQueryClient>, chequeId?: string) {
  qc.invalidateQueries({ queryKey: ["cheques"] });
  qc.invalidateQueries({ queryKey: ["chequeSummary"] });
  if (chequeId) {
    qc.invalidateQueries({ queryKey: ["cheque", chequeId] });
  }
  qc.invalidateQueries({ queryKey: ["cashAccounts"] });
  qc.invalidateQueries({ queryKey: ["treasuryOptions"] });
  qc.invalidateQueries({ queryKey: ["cashAccountStatement"] });
  for (const key of ACCOUNTING_QUERY_KEYS) {
    qc.invalidateQueries({ queryKey: [key] });
  }
  qc.invalidateQueries({ queryKey: ["clients"] });
}

export function useCheques(filters?: ChequeFilters) {
  return useQuery({
    queryKey: ["cheques", filters],
    queryFn: () => getCheques(filters),
  });
}

export function useChequeSummary() {
  return useQuery({
    queryKey: ["chequeSummary"],
    queryFn: () => getChequeSummary(),
  });
}

export function useCheque(id: string | null) {
  return useQuery({
    queryKey: ["cheque", id],
    queryFn: () => getCheque(id as string),
    enabled: Boolean(id),
  });
}

export function useReceiveCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReceiveChequePayload) => receiveCheque(payload),
    onSuccess: (data) => {
      invalidateChequeQueries(qc, data.id);
    },
  });
}

export function useDepositCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepositChequePayload }) =>
      depositCheque(id, payload),
    onSuccess: (data, vars) => {
      invalidateChequeQueries(qc, vars.id);
    },
  });
}

export function useClearCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClearChequePayload }) =>
      clearCheque(id, payload),
    onSuccess: (data, vars) => {
      invalidateChequeQueries(qc, vars.id);
    },
  });
}

export function useBounceCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BounceChequePayload }) =>
      bounceCheque(id, payload),
    onSuccess: (data, vars) => {
      invalidateChequeQueries(qc, vars.id);
    },
  });
}

export function useReturnCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnChequePayload }) =>
      returnCheque(id, payload),
    onSuccess: (data, vars) => {
      invalidateChequeQueries(qc, vars.id);
    },
  });
}
