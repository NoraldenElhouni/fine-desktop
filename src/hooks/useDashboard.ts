import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/endpoints/dashboard";

const REFRESH_MS = 30_000;

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboardKpis"],
    queryFn: async () => (await dashboardApi.kpis()).data,
    refetchInterval: REFRESH_MS,
  });
}

export function useUnitComparison() {
  return useQuery({
    queryKey: ["dashboardUnitComparison"],
    queryFn: async () => (await dashboardApi.unitComparison()).data,
    refetchInterval: REFRESH_MS,
  });
}

export function useOperationalPipeline() {
  return useQuery({
    queryKey: ["dashboardPipeline"],
    queryFn: async () => (await dashboardApi.operationalPipeline()).data,
    refetchInterval: REFRESH_MS,
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["dashboardApprovals"],
    queryFn: async () => (await dashboardApi.pendingApprovals()).data,
    refetchInterval: REFRESH_MS,
  });
}

/**
 * One-click inbox decisions: whatever was decided, refresh the whole
 * dashboard — counters, KPIs and the source lists all shift together.
 */
export function useInboxDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      id,
      decision,
    }: {
      kind: "credit" | "restock" | "payroll" | "leave";
      id: string;
      decision: "approve" | "reject";
    }) => {
      switch (kind) {
        case "credit":
          return dashboardApi.decideCreditApproval(id, decision);
        case "restock":
          return dashboardApi.decideRestock(id, decision);
        case "payroll":
          return dashboardApi.approvePayroll(id);
        case "leave":
          return dashboardApi.decideLeave(id, decision);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboardApprovals"] });
      qc.invalidateQueries({ queryKey: ["dashboardKpis"] });
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
      qc.invalidateQueries({ queryKey: ["leaveRequests"] });
      qc.invalidateQueries({ queryKey: ["salesOrders"] });
    },
  });
}
