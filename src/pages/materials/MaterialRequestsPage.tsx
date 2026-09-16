import React, { useMemo, useState } from "react";
import {
  PackageCheck,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  useMaterialRequests,
  useStartMaterialRequest,
  useFulfillMaterialRequest,
  useCancelMaterialRequest,
} from "../../hooks/useMaterials";
import {
  MaterialRequest,
  MaterialRequestModule,
  MaterialRequestStatus,
} from "../../api/endpoints/materials";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import {
  useMaterialRequestsColumns,
  MODULE_LABEL,
  STATUS_LABEL,
} from "../../components/table-columns/materialRequestsColumns";

export const MaterialRequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | "">("");
  const [moduleFilter, setModuleFilter] = useState<MaterialRequestModule | "">("");

  const { data, isLoading, refetch } = useMaterialRequests({
    status: statusFilter || undefined,
    fulfilling_module: moduleFilter || undefined,
  });

  const startMutation = useStartMaterialRequest();
  const fulfillMutation = useFulfillMaterialRequest();
  const cancelMutation = useCancelMaterialRequest();

  const requests: MaterialRequest[] = data?.data ?? [];

  const totalPending = requests.filter((r) => r.status === "pending").length;
  const totalInProgress = requests.filter((r) => r.status === "in_progress").length;

  const start = (id: string) => {
    startMutation.mutate(id, {
      onSuccess: () => toast.success("Started processing"),
      onError: (err: unknown) =>
        toast.error(
          apiErrorPayload(err)?.message ?? "Could not start the request.",
        ),
    });
  };

  const cancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success("Request cancelled"),
      onError: (err: unknown) =>
        toast.error(
          apiErrorPayload(err)?.message ?? "Could not cancel the request.",
        ),
    });
  };

  const columns = useMaterialRequestsColumns({
    onStart: start,
    onCancel: cancel,
    startPending: startMutation.isPending,
    cancelPending: cancelMutation.isPending,
    fulfillPending: fulfillMutation.isPending,
    fulfillVariables: fulfillMutation.variables,
  });

  const tableData = useMemo(() => requests, [requests]);
  const requestsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (r) => r.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <PackageCheck className="h-7 w-7 text-app-accent" />
            طلبات المواد (Material Requests)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            طلبات بين الوحدات لتوفير مواد مطلوبة من BOM أوامر الإنتاج أو القطع.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-app-bg-primary border border-app-separator px-3 py-1.5 text-xs">
            <span className="rounded-full bg-app-status-yellow/15 text-app-status-yellow px-2 py-0.5 font-bold">
              Pending: {totalPending}
            </span>
            <span className="rounded-full bg-app-status-info/15 text-app-status-info px-2 py-0.5 font-bold">
              In Progress: {totalInProgress}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> تحديث
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 bg-app-bg-primary p-3 rounded-2xl border border-app-separator shadow-sm">
        <span className="text-xs font-semibold text-app-label-secondary">الحالة:</span>
        <SearchableSelect<{ value: string; label: string }>
          options={[
            { value: "", label: "All" },
            { value: "pending", label: STATUS_LABEL.pending },
            { value: "in_progress", label: STATUS_LABEL.in_progress },
            { value: "fulfilled", label: STATUS_LABEL.fulfilled },
            { value: "cancelled", label: STATUS_LABEL.cancelled },
          ]}
          value={statusFilter ? { value: statusFilter, label: STATUS_LABEL[statusFilter] } : { value: "", label: "All" }}
          onChange={(v) => setStatusFilter((v?.value ?? "") as MaterialRequestStatus | "")}
          getOptionId={(v) => v.value}
          getOptionLabel={(v) => v.label}
          placeholder="All"
          size="sm"
        />
        <span className="text-xs font-semibold text-app-label-secondary ms-2">الوحدة:</span>
        <SearchableSelect<{ value: string; label: string }>
          options={[
            { value: "", label: "All" },
            { value: "cutter", label: MODULE_LABEL.cutter },
            { value: "foam", label: MODULE_LABEL.foam },
            { value: "procurement", label: MODULE_LABEL.procurement },
          ]}
          value={moduleFilter ? { value: moduleFilter, label: MODULE_LABEL[moduleFilter] } : { value: "", label: "All" }}
          onChange={(v) => setModuleFilter((v?.value ?? "") as MaterialRequestModule | "")}
          getOptionId={(v) => v.value}
          getOptionLabel={(v) => v.label}
          placeholder="All"
          size="sm"
        />
      </div>

      <DataTable table={requestsTable}>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage="لا توجد طلبات مواد مفتوحة. الإنتاج غير محجوب."
          emptyIcon={PackageCheck}
        />
        <DataTable.Pagination />
      </DataTable>
    </div>
  );
};
