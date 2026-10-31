import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  employeeAdvancesApi,
  type CreateEmployeeAdvancePayload,
  type EmployeeAdvanceFilters,
} from "../api/endpoints/employeeAdvances";

/** W5-02: the advances list (unit-scoped by the pinned unit, like the other HR lists). */
export function useEmployeeAdvances(filters?: EmployeeAdvanceFilters) {
  return useQuery({
    queryKey: ["employeeAdvances", filters],
    queryFn: () => employeeAdvancesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** One advance with its schedule and the entries posted against it. */
export function useEmployeeAdvance(id: string | null) {
  return useQuery({
    queryKey: ["employeeAdvance", id],
    queryFn: () => employeeAdvancesApi.get(id as string),
    enabled: Boolean(id),
  });
}

const LEDGER_QUERY_KEYS = [
  "journalEntries",
  "journalEntry",
  "trialBalance",
  "accountLedger",
  "balanceSheet",
  "cashAccounts",
  "treasuryOptions",
  "cashAccountStatement",
] as const;

/**
 * Every advance mutation refreshes the advances. A payout or repayment also posts
 * to the ledger and may flag a calculated payroll for recalculation (HR-12), so
 * those refresh the ledger, treasury and payroll views too.
 */
function useAdvanceMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>, posts = false) {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["employeeAdvances"] });
    qc.invalidateQueries({ queryKey: ["employeeAdvance"] });
  };
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      refresh();
      if (posts) {
        for (const key of LEDGER_QUERY_KEYS) qc.invalidateQueries({ queryKey: [key] });
        qc.invalidateQueries({ queryKey: ["payrollRuns"] });
        qc.invalidateQueries({ queryKey: ["payslips"] });
      }
    },
    // A refusal often means the advance moved on the server: show its real state.
    onError: refresh,
  });
}

export function useRequestAdvance() {
  return useAdvanceMutation((payload: CreateEmployeeAdvancePayload) => employeeAdvancesApi.create(payload));
}

export function useApproveAdvance() {
  return useAdvanceMutation((id: string) => employeeAdvancesApi.approve(id));
}

export function usePayAdvance() {
  return useAdvanceMutation(
    ({ id, cashAccountId }: { id: string; cashAccountId: string }) => employeeAdvancesApi.pay(id, cashAccountId),
    true,
  );
}

export function useRepayAdvance() {
  return useAdvanceMutation(
    ({ id, amount, cashAccountId }: { id: string; amount: number; cashAccountId: string }) =>
      employeeAdvancesApi.repay(id, amount, cashAccountId),
    true,
  );
}

export function useCancelAdvance() {
  return useAdvanceMutation((id: string) => employeeAdvancesApi.cancel(id));
}
