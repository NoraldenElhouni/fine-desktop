import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTreasuryVouchers,
  getTreasuryVoucher,
  createTreasuryVoucher,
  cancelTreasuryVoucher,
  type TreasuryVoucherFilters,
  type CreateTreasuryVoucherPayload,
} from "../api/endpoints/treasuryVouchers";

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

export function useTreasuryVouchers(filters?: TreasuryVoucherFilters) {
  return useQuery({
    queryKey: ["treasuryVouchers", filters],
    queryFn: () => getTreasuryVouchers(filters),
  });
}

export function useTreasuryVoucher(id: string | null) {
  return useQuery({
    queryKey: ["treasuryVouchers", id],
    queryFn: () => getTreasuryVoucher(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTreasuryVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTreasuryVoucherPayload) => createTreasuryVoucher(payload),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["treasuryVouchers"] });
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
      qc.invalidateQueries({ queryKey: ["treasuryOptions"] });
      qc.invalidateQueries({ queryKey: ["cashAccountStatement"] });
      for (const key of ACCOUNTING_QUERY_KEYS) {
        qc.invalidateQueries({ queryKey: [key] });
      }
      if (vars.client_id || data.client) {
        qc.invalidateQueries({ queryKey: ["clients"] });
      }
    },
  });
}

export function useCancelTreasuryVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelTreasuryVoucher(id, { reason }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["treasuryVouchers"] });
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
      qc.invalidateQueries({ queryKey: ["treasuryOptions"] });
      qc.invalidateQueries({ queryKey: ["cashAccountStatement"] });
      for (const key of ACCOUNTING_QUERY_KEYS) {
        qc.invalidateQueries({ queryKey: [key] });
      }
      if (data.client) {
        qc.invalidateQueries({ queryKey: ["clients"] });
      }
    },
  });
}
