import apiClient from "../client";

export interface DashboardKpis {
  period: { from: string; to: string };
  revenue_mtd: number;
  cogs_mtd: number;
  gross_margin_pct: number | null;
  net_profit_mtd: number;
  cash_position: number;
  fx_exposure: Record<string, number>;
  pending_approvals: { credit: number; restock: number; payroll: number; leave: number };
}

export interface UnitComparisonRow {
  operating_unit_id: string;
  unit_name: string;
  revenue: number;
  expenses: number;
  net: number;
  inventory_value: number;
}

export interface UnitComparison {
  period: string;
  rows: UnitComparisonRow[];
  unallocated_net: number;
}

export interface PipelineBreakdown {
  total: number;
  statuses: Record<string, number>;
}

export type OperationalPipeline = Record<
  "import_orders" | "foam_batches" | "cutter_work_orders" | "furniture_orders" | "sales_orders",
  PipelineBreakdown
>;

export interface PendingApprovals {
  credit_approvals: { id: string; order_number: string | null; client_name: string | null; amount_over_limit: number }[];
  restock_requests: { id: string; request_number: string; requesting_unit: string | null; source_unit: string | null }[];
  payroll_runs: { id: string; period: string; total_net: number }[];
  leave_requests: { id: string; employee_name: string | null; start_date: string; end_date: string; leave_type: string }[];
  total: number;
}

export const dashboardApi = {
  kpis: () => apiClient.get<DashboardKpis>("/dashboard/kpis"),
  unitComparison: () => apiClient.get<UnitComparison>("/dashboard/unit-comparison"),
  operationalPipeline: () => apiClient.get<OperationalPipeline>("/dashboard/operational-pipeline"),
  pendingApprovals: () => apiClient.get<PendingApprovals>("/dashboard/pending-approvals"),

  decideCreditApproval: (id: string, decision: "approve" | "reject") =>
    apiClient.put(`/credit-approval-requests/${id}/${decision}`),

  decideRestock: (id: string, decision: "approve" | "reject") =>
    apiClient.put(`/internal-restock-requests/${id}/${decision}`),

  approvePayroll: (id: string) => apiClient.post(`/payroll-runs/${id}/approve`),

  decideLeave: (id: string, decision: "approve" | "reject") =>
    apiClient.put(`/leave-requests/${id}/${decision}`),
};
