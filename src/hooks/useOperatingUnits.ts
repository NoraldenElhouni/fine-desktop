import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuditLogs } from "../api/endpoints/auditLogs";
import {
  BlueprintEntry,
  OperatingUnit,
  OperatingUnitCreatePayload,
  OperatingUnitUpdatePayload,
  UnitBlueprintCreatePayload,
  UnitBlueprintUpdatePayload,
} from "../types/entities";
import {
  createOperatingUnit,
  createUnitBlueprint,
  deleteOperatingUnit,
  deleteUnitBlueprint,
  getOperatingUnit,
  getOperatingUnits,
  getUnitBlueprint,
  getUnitBlueprints,
  restoreOperatingUnit,
  restoreUnitBlueprint,
  updateOperatingUnit,
  updateUnitBlueprint,
} from "../api/endpoints/operatingUnits";

export function useOperatingUnits(options: { withTrashed?: boolean } = {}) {
  return useQuery({
    queryKey: ["operatingUnits", options],
    queryFn: () => getOperatingUnits({ withTrashed: options.withTrashed }),
  });
}

export function useOperatingUnit(id?: string) {
  return useQuery({
    queryKey: ["operatingUnit", id],
    queryFn: () => getOperatingUnit(id as string),
    enabled: Boolean(id),
  });
}

export function useUnitBlueprints(options: { withTrashed?: boolean } = {}) {
  return useQuery({
    queryKey: ["unitBlueprints", options],
    queryFn: () => getUnitBlueprints({ withTrashed: options.withTrashed }),
  });
}

export function useUnitBlueprint(id?: string) {
  return useQuery({
    queryKey: ["unitBlueprint", id],
    queryFn: () => getUnitBlueprint(id as string),
    enabled: Boolean(id),
  });
}

export function useAuditLog(args: {
  table: string;
  recordId: string | undefined;
  action?: "created" | "updated" | "deleted" | "restored";
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ["auditLog", args.table, args.recordId, args.action, args.from, args.to],
    queryFn: () =>
      getAuditLogs({
        table: args.table,
        recordId: args.recordId as string,
        action: args.action,
        from: args.from,
        to: args.to,
      }),
    enabled: Boolean(args.recordId),
  });
}

function invalidateOperatingUnits(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["operatingUnits"] });
  qc.invalidateQueries({ queryKey: ["operatingUnit"] });
  qc.invalidateQueries({ queryKey: ["users"] });
  qc.invalidateQueries({ queryKey: ["entities"] });
  qc.invalidateQueries({ queryKey: ["employees"] });
  qc.invalidateQueries({ queryKey: ["suppliers"] });
  qc.invalidateQueries({ queryKey: ["clients"] });
  qc.invalidateQueries({ queryKey: ["salesOrders"] });
}

export function useCreateOperatingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OperatingUnitCreatePayload) => createOperatingUnit(payload),
    onSuccess: () => invalidateOperatingUnits(qc),
  });
}

export function useUpdateOperatingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & OperatingUnitUpdatePayload) =>
      updateOperatingUnit(id, patch),
    onSuccess: (_, vars) => {
      invalidateOperatingUnits(qc);
      qc.invalidateQueries({ queryKey: ["auditLog", "operating_units", vars.id] });
    },
  });
}

export function useDeleteOperatingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOperatingUnit(id),
    onSuccess: () => invalidateOperatingUnits(qc),
  });
}

export function useRestoreOperatingUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreOperatingUnit(id),
    onSuccess: () => invalidateOperatingUnits(qc),
  });
}

function invalidateBlueprints(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["unitBlueprints"] });
  qc.invalidateQueries({ queryKey: ["unitBlueprint"] });
  qc.invalidateQueries({ queryKey: ["operatingUnits"] });
  qc.invalidateQueries({ queryKey: ["operatingUnit"] });
}

export function useCreateUnitBlueprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnitBlueprintCreatePayload) => createUnitBlueprint(payload),
    onSuccess: () => invalidateBlueprints(qc),
  });
}

export function useUpdateUnitBlueprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UnitBlueprintUpdatePayload) =>
      updateUnitBlueprint(id, patch),
    onSuccess: (_, vars) => {
      invalidateBlueprints(qc);
      qc.invalidateQueries({ queryKey: ["auditLog", "unit_blueprints", vars.id] });
    },
  });
}

export function useDeleteUnitBlueprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUnitBlueprint(id),
    onSuccess: () => invalidateBlueprints(qc),
  });
}

export function useRestoreUnitBlueprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreUnitBlueprint(id),
    onSuccess: () => invalidateBlueprints(qc),
  });
}

export type {
  BlueprintEntry,
  OperatingUnit,
  OperatingUnitCreatePayload,
  OperatingUnitUpdatePayload,
  UnitBlueprintCreatePayload,
  UnitBlueprintUpdatePayload,
};
