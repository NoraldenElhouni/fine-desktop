import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Hammer, AlertTriangle, ChevronLeft, HardHat, Package, CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useProductionOrder, useTransitionProductionOrder, useLogLabor } from "../../hooks/useFurniture";
import { getEmployees } from "../../api/endpoints/employees";
import {
  ORDER_STATUS_ORDER, ORDER_STATUS_LABEL, ORDER_NEXT_STATUS, LABOR_LOG_STATES,
} from "../../api/endpoints/furniture";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const ProductionOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useProductionOrder(orderId);
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => getEmployees() });
  const transitionMutation = useTransitionProductionOrder();
  const logLaborMutation = useLogLabor(orderId);

  const [error, setError] = useState<string | null>(null);
  const [laborForm, setLaborForm] = useState({ employee: "", role: "tailor", hours: "" });

  if (isLoading || !order) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        Loading order…
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
      { onError: (e) => fail(e, "Could not advance the order.") },
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
        onError: (e) => fail(e, "Could not log the hours."),
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <button
          onClick={() => navigate("/furniture/orders")}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Back to orders
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Hammer className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{order.order_number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          {order.product?.name} × {order.quantity} · BOM v{order.bom?.version}
          {" · "}material <span className="font-mono">{formatNumber(order.material_cost)}</span>
          {" + "}labor <span className="font-mono">{formatNumber(order.labor_cost)}</span>
          {" = "}<span className="font-mono font-bold">{formatNumber(totalCost)} LYD</span>
        </p>
      </div>

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
              {transitionMutation.isPending ? "Advancing…" : `Advance to ${ORDER_STATUS_LABEL[nextStatus]}`}
            </button>
          )}
        </div>

        {order.status === "bom_confirmed" && (
          <p className="mt-3 text-xs text-app-label-secondary">
            Starting production reserves every component from stock — or refuses with what is short.
          </p>
        )}
      </div>

      {/* BOM */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">Bill of Materials</h2>
        </div>
        <table className="w-full text-start text-xs">
          <tbody className="divide-y divide-app-separator text-app-label-primary">
            {order.bom?.component_lines?.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2">
                  {l.inventory_item?.name}
                  <span className="text-app-label-tertiary font-mono ms-2">{l.inventory_item?.sku}</span>
                </td>
                <td className="px-4 py-2 text-end font-mono">
                  × {Number(l.quantity)} per unit → {Number(l.quantity) * order.quantity} total
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Labor */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
          <HardHat className="w-4 h-4 text-app-accent" />
          <h2 className="text-sm font-bold text-app-label-primary">Labor</h2>
          {!canLogLabor && (
            <span className="text-[10px] text-app-label-tertiary">
              — logging opens during production and closes after quality check
            </span>
          )}
        </div>

        <div className="divide-y divide-app-separator">
          {order.labor_logs?.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 text-xs">
              <span className="font-semibold text-app-label-primary flex-1">
                {l.employee?.entity?.name ?? "—"}
                <span className="text-app-label-tertiary ms-2 capitalize">{l.role}</span>
              </span>
              <span className="font-mono">{Number(l.hours_logged)} h</span>
              <span className="font-mono text-app-label-secondary">
                @ {formatNumber(l.hourly_rate_at_log)} ={" "}
                {formatNumber(Number(l.hours_logged) * Number(l.hourly_rate_at_log))}
              </span>
            </div>
          ))}
          {(order.labor_logs?.length ?? 0) === 0 && (
            <div className="px-4 py-6 text-center text-xs text-app-label-tertiary">
              No hours logged yet.
            </div>
          )}
        </div>

        {canLogLabor && (
          <form onSubmit={submitLabor} className="border-t border-app-separator p-3 flex flex-wrap gap-2 items-end">
            <select
              required
              value={laborForm.employee}
              onChange={(e) => setLaborForm({ ...laborForm, employee: e.target.value })}
              className="flex-1 min-w-40 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
            >
              <option value="">Employee…</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {(e as { entity?: { name?: string } }).entity?.name ?? e.job_title ?? e.id}
                </option>
              ))}
            </select>
            <select
              value={laborForm.role}
              onChange={(e) => setLaborForm({ ...laborForm, role: e.target.value })}
              className="px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
            >
              {["tailor", "carpenter", "upholsterer", "assembler", "operator", "other"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              type="number" step="0.25" min="0.25" required placeholder="hours"
              value={laborForm.hours}
              onChange={(e) => setLaborForm({ ...laborForm, hours: e.target.value })}
              className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={logLaborMutation.isPending || !laborForm.employee || num(laborForm.hours) <= 0}
              className="rounded-xl bg-app-accent px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            >
              {logLaborMutation.isPending ? "Logging…" : "Log Hours"}
            </button>
            <p className="w-full text-[10px] text-app-label-tertiary">
              The rate comes from the BOM's matching role and is fixed at the moment of logging.
            </p>
          </form>
        )}
      </div>

      {/* Finished good */}
      {order.finished_stock_lot && (
        <div className="rounded-2xl border border-app-accent/40 bg-app-accent-tint p-4">
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4 text-app-accent" />
            <span className="font-bold text-app-label-primary">Finished good</span>
            <span className="font-mono font-bold text-app-accent">
              {order.finished_stock_lot.lot_number}
            </span>
            <span className="font-mono text-app-label-secondary">
              {order.quantity} × {formatNumber(order.finished_stock_lot.unit_cost)} LYD
            </span>
            {order.status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-app-label-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-app-status-positive" /> collected
              </span>
            ) : (
              <span className="text-app-label-secondary">in stock, awaiting collection</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
