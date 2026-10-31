import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  employeeAdjustmentsApi,
  payItemsApi,
  type AdjustmentPayload,
  type EmployeeAdjustmentFilters,
  type PayItemKind,
  type PayItemPayload,
} from "../api/endpoints/payItems";
import { useReferenceLookups } from "./useReferenceLookups";

/** W5-03: one employee's standing allowances and deductions. */
export function useEmployeePayItems(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["employeePayItems", employeeId],
    queryFn: () => payItemsApi.list(employeeId as string),
    enabled: Boolean(employeeId),
  });
}

/** W5-03: one-off rewards and deductions (unit-scoped by the pinned unit, like the other HR lists). */
export function useEmployeeAdjustments(filters?: EmployeeAdjustmentFilters) {
  return useQuery({
    queryKey: ["employeeAdjustments", filters],
    queryFn: () => employeeAdjustmentsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * A pay item change, an approval or removing an approved adjustment may flag a
 * calculated payroll run for recalculation (HR-13), so every mutation refreshes
 * the payroll views too. A refusal often means the record moved on the server:
 * refresh on error as well.
 */
function usePayMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>, key: "employeePayItems" | "employeeAdjustments") {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: [key] });
    qc.invalidateQueries({ queryKey: ["payrollRuns"] });
    qc.invalidateQueries({ queryKey: ["payslips"] });
  };
  return useMutation({ mutationFn: fn, onSuccess: refresh, onError: refresh });
}

export function useCreatePayItem() {
  return usePayMutation(
    ({ employeeId, payload }: { employeeId: string; payload: PayItemPayload }) => payItemsApi.create(employeeId, payload),
    "employeePayItems",
  );
}

export function useUpdatePayItem() {
  return usePayMutation(
    ({
      employeeId,
      itemId,
      payload,
    }: {
      employeeId: string;
      itemId: string;
      payload: Partial<PayItemPayload> & { record_version?: number };
    }) => payItemsApi.update(employeeId, itemId, payload),
    "employeePayItems",
  );
}

export function useDeletePayItem() {
  return usePayMutation(
    ({ employeeId, itemId }: { employeeId: string; itemId: string }) => payItemsApi.remove(employeeId, itemId),
    "employeePayItems",
  );
}

export function useCreateAdjustment() {
  return usePayMutation((payload: AdjustmentPayload) => employeeAdjustmentsApi.create(payload), "employeeAdjustments");
}

export function useUpdateAdjustment() {
  return usePayMutation(
    ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<AdjustmentPayload, "employee_id">> & { record_version?: number };
    }) => employeeAdjustmentsApi.update(id, payload),
    "employeeAdjustments",
  );
}

export function useApproveAdjustment() {
  return usePayMutation((id: string) => employeeAdjustmentsApi.approve(id), "employeeAdjustments");
}

export function useDeleteAdjustment() {
  return usePayMutation((id: string) => employeeAdjustmentsApi.remove(id), "employeeAdjustments");
}

/**
 * The allowance and deduction types (reference lookups) with a name lookup by
 * code, matched case-insensitively like payroll matches them. Inactive types
 * stay in `nameOf` so old lines keep their names.
 */
export function usePayCodes() {
  const allowances = useReferenceLookups("allowance-types");
  const deductions = useReferenceLookups("deduction-types");

  const names = useMemo(() => {
    const map: Record<PayItemKind, Map<string, string>> = { addition: new Map(), deduction: new Map() };
    for (const entry of allowances.data ?? []) map.addition.set(entry.code.trim().toUpperCase(), entry.name);
    for (const entry of deductions.data ?? []) map.deduction.set(entry.code.trim().toUpperCase(), entry.name);
    return map;
  }, [allowances.data, deductions.data]);

  const nameOf = useCallback(
    (kind: PayItemKind, code: string): string => names[kind].get(code.trim().toUpperCase()) ?? code,
    [names],
  );

  return {
    allowanceTypes: allowances.data ?? [],
    deductionTypes: deductions.data ?? [],
    isLoading: allowances.isLoading || deductions.isLoading,
    nameOf,
  };
}
