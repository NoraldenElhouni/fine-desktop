import React, { useState } from "react";
import {
  PackageCheck,
  Plus,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Scissors,
  Factory,
  ShoppingCart,
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
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const MODULE_LABEL: Record<MaterialRequestModule, string> = {
  cutter: "Cutter",
  foam: "Foam",
  procurement: "Procurement",
};

const STATUS_STYLE: Record<MaterialRequestStatus, string> = {
  pending: "bg-app-status-yellow/15 text-app-status-yellow",
  in_progress: "bg-app-status-info/15 text-app-status-info",
  fulfilled: "bg-app-status-positive/15 text-app-status-positive",
  cancelled: "bg-app-bg-tertiary text-app-label-tertiary",
};

const STATUS_LABEL: Record<MaterialRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

function ModuleIcon({ module }: { module: MaterialRequestModule }) {
  if (module === "cutter") return <Scissors className="h-3.5 w-3.5" />;
  if (module === "foam") return <Factory className="h-3.5 w-3.5" />;
  return <ShoppingCart className="h-3.5 w-3.5" />;
}

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

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            جاري التحميل...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-app-label-tertiary text-sm">
            لا توجد طلبات مواد مفتوحة. الإنتاج غير محجوب.
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">الصنف</th>
                <th className="px-4 py-3 text-start">الوحدة</th>
                <th className="px-4 py-3 text-end">الكمية</th>
                <th className="px-4 py-3 text-start">الأبعاد المطلوبة</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">المصدر</th>
                <th className="px-4 py-3 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-app-fill-f1/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold">{r.inventory_item?.name ?? "—"}</div>
                    <div className="text-[10px] font-mono text-app-label-tertiary">
                      {r.inventory_item?.sku ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-app-bg-secondary border border-app-separator",
                      )}
                    >
                      <ModuleIcon module={r.fulfilling_module} />
                      {MODULE_LABEL[r.fulfilling_module]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end font-mono font-bold">
                    {r.quantity}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-app-label-secondary">
                    {r.target_dimensions
                      ? `${r.target_dimensions.length_m ?? "-"} × ${r.target_dimensions.width_m ?? "-"} × ${r.target_dimensions.height_m ?? "-"} م`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
                        STATUS_STYLE[r.status],
                      )}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-app-label-tertiary font-mono">
                    {r.requested_for_type && r.requested_for_id
                      ? `${r.requested_for_type}#${r.requested_for_id.slice(0, 8)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="inline-flex items-center gap-1">
                      {r.status === "pending" && (
                        <button
                          onClick={() => start(r.id)}
                          disabled={startMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-app-status-info/40 bg-app-status-info/10 px-2 py-1 text-[11px] font-bold text-app-status-info hover:bg-app-status-info/15 disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" /> بدء
                        </button>
                      )}
                      {(r.status === "pending" || r.status === "in_progress") && (
                        <button
                          onClick={() => cancel(r.id)}
                          disabled={cancelMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg border border-app-status-danger/40 bg-app-status-danger/10 px-2 py-1 text-[11px] font-bold text-app-status-danger hover:bg-app-status-danger/15 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" /> إلغاء
                        </button>
                      )}
                      <span
                        className={cn(
                          tokens.typography.webUI.c1Regular,
                          "text-[10px] text-app-label-tertiary italic",
                        )}
                      >
                        {fulfillMutation.isPending && r.id === (fulfillMutation.variables as { id: string } | undefined)?.id
                          ? "..."
                          : ""}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
