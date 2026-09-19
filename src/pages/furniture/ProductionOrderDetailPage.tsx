import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowRight, Hammer, AlertTriangle, ChevronLeft, HardHat, Package, PackageCheck, CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useProductionOrder, useTransitionProductionOrder, useLogLabor } from "../../hooks/useFurniture";
import { useMaterialRequestsForProductionOrder } from "../../hooks/useMaterials";
import { getEmployees } from "../../api/endpoints/employees";
import {
  ORDER_STATUS_ORDER, ORDER_STATUS_LABEL, ORDER_NEXT_STATUS, LABOR_LOG_STATES,
} from "../../api/endpoints/furniture";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useProductionOrderBomColumns } from "../../components/table-columns/productionOrderBomColumns";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const ROLE_LABEL: Record<string, string> = {
  tailor: "خياط",
  carpenter: "نجار",
  upholsterer: "منجّد",
  assembler: "مُجمِّع",
  operator: "مشغّل",
  other: "أخرى",
};

export const ProductionOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useProductionOrder(orderId);
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => getEmployees() });
  const { data: materialRequestsData } = useMaterialRequestsForProductionOrder(orderId);
  const transitionMutation = useTransitionProductionOrder();
  const logLaborMutation = useLogLabor(orderId);

  const [error, setError] = useState<string | null>(null);
  const [laborForm, setLaborForm] = useState({ employee: "", role: "tailor", hours: "" });

  // BOM lines — a small, fixed-size breakdown for this one order, so no search/pagination.
  const bomColumns = useProductionOrderBomColumns({ orderQuantity: order?.quantity });
  const bomTableData = useMemo(() => order?.bom?.component_lines ?? [], [order]);
  const bomTable = useDataTable({
    columns: bomColumns,
    data: bomTableData,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (l) => l.id,
  });

  if (isLoading || !order) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">
        جاري تحميل الطلب…
      </div>
    );
  }

  const nextStatus = ORDER_NEXT_STATUS[order.status];
  const canLogLabor = LABOR_LOG_STATES.includes(order.status);
  const totalCost = Number(order.material_cost) + Number(order.labor_cost);

  const fail = (err: unknown, fallback: string) => {
    const payload = apiErrorPayload(err);
    setError(
      payload?.code === "INSUFFICIENT_COMPONENT_STOCK"
        ? payload.message ?? fallback
        : payload?.message ?? fallback,
    );
  };

  const advance = () => {
    if (!orderId || !nextStatus) return;
    setError(null);
    transitionMutation.mutate(
      { id: orderId, status: nextStatus },
      { onError: (e) => fail(e, "تعذّر نقل الطلب إلى المرحلة التالية.") },
    );
  };

  const submitLabor = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    logLaborMutation.mutate(
      {
        employee_id: laborForm.employee,
        role: laborForm.role,
        hours_logged: num(laborForm.hours),
      },
      {
        onSuccess: () => setLaborForm({ employee: "", role: "tailor", hours: "" }),
        onError: (e) => fail(e, "تعذّر تسجيل الساعات."),
      },
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button
          onClick={() => navigate("/furniture/orders")}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى الطلبات
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Hammer className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{order.order_number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          {order.product?.name} × {order.quantity} · قائمة مواد (BOM) إصدار {order.bom?.version}
          {" · "}المواد <span className="font-mono">{formatNumber(order.material_cost)}</span>
          {" + "}العمالة <span className="font-mono">{formatNumber(order.labor_cost)}</span>
          {" = "}<span className="font-mono font-bold">{formatNumber(totalCost)} LYD</span>
        </p>
      </div>

      {(order.awaiting_material_requests_count ?? 0) > 0 && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-info/40 bg-app-status-info/10 p-4 text-xs text-app-status-info">
          <PackageCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">
              {order.awaiting_material_requests_count} طلب مواد مفتوح
            </div>
            <div className="text-[11px] mt-1">
              لا يمكن بدء التجميع حتى تكتمل كل طلبات المواد المرتبطة.
              <a
                href="/material-requests"
                className="ms-2 font-bold underline hover:no-underline"
              >
                عرض قائمة طلبات المواد ←
              </a>
            </div>
            {materialRequestsData?.data && materialRequestsData.data.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {materialRequestsData.data.slice(0, 5).map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 rounded-full bg-app-bg-primary px-2 py-0.5 text-[10px] font-mono border border-app-status-info/30"
                  >
                    {r.inventory_item?.sku ?? "—"} × {r.quantity}
                  </span>
                ))}
                {materialRequestsData.data.length > 5 && (
                  <span className="text-[10px] text-app-status-info/70">
                    +{materialRequestsData.data.length - 5} أخرى
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          {ORDER_STATUS_ORDER.map((s) => {
            const reached = ORDER_STATUS_ORDER.indexOf(s) <= ORDER_STATUS_ORDER.indexOf(order.status);
            const current = s === order.status;
            return (
              <span
                key={s}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                  current
                    ? "bg-app-accent text-white"
                    : reached
                      ? "bg-app-accent-subtle text-app-accent"
                      : "bg-app-fill-f1 text-app-label-tertiary"
                }`}
              >
                {ORDER_STATUS_LABEL[s]}
              </span>
            );
          })}

          {nextStatus && (
            <button
              onClick={advance}
              disabled={transitionMutation.isPending}
              className="ms-auto flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              {transitionMutation.isPending ? "جاري النقل…" : `الانتقال إلى ${ORDER_STATUS_LABEL[nextStatus]}`}
            </button>
          )}
        </div>

        {order.status === "bom_confirmed" && (
          <p className="mt-3 text-xs text-app-label-secondary">
            بدء الإنتاج يحجز كل مكوّن من المخزون — أو يُرفض مع بيان النقص إن وُجد.
          </p>
        )}
      </div>

      {/* BOM */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">قائمة المواد (BOM)</h2>
        </div>
        <DataTable table={bomTable} className="rounded-none border-0 shadow-none bg-transparent">
          <DataTable.Content emptyMessage="لا توجد بنود قائمة مواد." />
        </DataTable>
      </div>

      {/* Labor */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
          <HardHat className="w-4 h-4 text-app-accent" />
          <h2 className="text-sm font-bold text-app-label-primary">العمالة</h2>
          {!canLogLabor && (
            <span className="text-[10px] text-app-label-tertiary">
              — يُفتح التسجيل أثناء الإنتاج ويُغلق بعد فحص الجودة
            </span>
          )}
        </div>

        <div className="divide-y divide-app-separator">
          {order.labor_logs?.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 text-xs">
              <span className="font-semibold text-app-label-primary flex-1">
                {l.employee?.entity?.name ?? "—"}
                <span className="text-app-label-tertiary ms-2">{ROLE_LABEL[l.role] ?? l.role}</span>
              </span>
              <span className="font-mono">{Number(l.hours_logged)} ساعة</span>
              <span className="font-mono text-app-label-secondary">
                @ {formatNumber(l.hourly_rate_at_log)} ={" "}
                {formatNumber(Number(l.hours_logged) * Number(l.hourly_rate_at_log))}
              </span>
            </div>
          ))}
          {(order.labor_logs?.length ?? 0) === 0 && (
            <div className="px-4 py-6 text-center text-xs text-app-label-tertiary">
              لا توجد ساعات مسجّلة بعد.
            </div>
          )}
        </div>

        {canLogLabor && (
          <form onSubmit={submitLabor} className="border-t border-app-separator p-3 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الموظف</label>
              <SearchableSelect<{ id: string; entity?: { name?: string }; job_title?: string }>
                options={employees ?? []}
                value={
                  employees?.find((e) => e.id === laborForm.employee) ?? null
                }
                onChange={(e) =>
                  setLaborForm({ ...laborForm, employee: e ? e.id : "" })
                }
                getOptionId={(e) => e.id}
                getOptionLabel={(e) =>
                  e.entity?.name ?? e.job_title ?? e.id
                }
                getOptionSubLabel={(e) => e.job_title}
                getOptionSearchText={(e) =>
                  `${e.entity?.name ?? ""} ${e.job_title ?? ""}`
                }
                placeholder="اختر الموظف…"
                size="sm"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الدور</label>
              <select
                value={laborForm.role}
                onChange={(e) => setLaborForm({ ...laborForm, role: e.target.value })}
                className="px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
              >
                {["tailor", "carpenter", "upholsterer", "assembler", "operator", "other"].map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الساعات</label>
              <input
                type="number" step="0.25" min="0.25" required placeholder="0.25"
                value={laborForm.hours}
                onChange={(e) => setLaborForm({ ...laborForm, hours: e.target.value })}
                className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={logLaborMutation.isPending || !laborForm.employee || num(laborForm.hours) <= 0}
              className="rounded-xl bg-app-accent px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            >
              {logLaborMutation.isPending ? "جاري التسجيل…" : "تسجيل الساعات"}
            </button>
            <p className="w-full text-[10px] text-app-label-tertiary">
              يُستمد المعدل من الدور المطابق في قائمة المواد (BOM) ويُثبَّت لحظة التسجيل.
            </p>
          </form>
        )}
      </div>

      {/* Finished good */}
      {order.finished_stock_lot && (
        <div className="rounded-2xl border border-app-accent/40 bg-app-accent-tint p-4">
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4 text-app-accent" />
            <span className="font-bold text-app-label-primary">المنتج التام</span>
            <span className="font-mono font-bold text-app-accent">
              {order.finished_stock_lot.lot_number}
            </span>
            <span className="font-mono text-app-label-secondary">
              {order.quantity} × {formatNumber(order.finished_stock_lot.unit_cost)} LYD
            </span>
            {order.status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-app-label-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-app-status-positive" /> تم الاستلام
              </span>
            ) : (
              <span className="text-app-label-secondary">في المخزون، بانتظار الاستلام</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
