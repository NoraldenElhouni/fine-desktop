import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hammer, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { useProductionOrders, useCreateProductionOrder, useProducts } from "../../hooks/useFurniture";
import {
  ORDER_STATUS_ORDER, ORDER_STATUS_LABEL, ProductionOrderStatus,
} from "../../api/endpoints/furniture";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";

export const ProductionOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_number: "", product_id: "", quantity: "1" });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useProductionOrders({ status: statusFilter || undefined });
  const { data: products } = useProducts();
  const createMutation = useCreateProductionOrder();

  const orders = data?.data ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        order_number: form.order_number,
        product_id: form.product_id,
        quantity: Number(form.quantity) || 1,
      },
      {
        onSuccess: (res) => {
          setShowForm(false);
          navigate(`/furniture/orders/${res.data.id}`);
        },
        onError: (err: unknown) => {
          const payload = apiErrorPayload(err);
          setError(
            payload?.code === "NO_ACTIVE_BOM"
              ? "This product has no active BOM — build one on the Products page first."
              : payload?.errors?.order_number?.[0] ?? payload?.message ?? "Could not create the order.",
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Hammer className="w-7 h-7 text-app-accent" />
            Furniture Production Orders
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            BOM-driven assembly. Confirming reserves component stock; consumption costs the order from
            the real lots taken.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            statusFilter === "" ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
          }`}
        >
          All
        </button>
        {ORDER_STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusFilter === s ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">Loading…</div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Order</th>
                <th className="px-4 py-3 text-start">Product</th>
                <th className="px-4 py-3 text-start">Qty</th>
                <th className="px-4 py-3 text-start">Material</th>
                <th className="px-4 py-3 text-start">Labor</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{o.order_number}</td>
                  <td className="px-4 py-3">{o.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-bold">{o.quantity}</td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {formatNumber(o.material_cost)}
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {formatNumber(o.labor_cost)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => navigate(`/furniture/orders/${o.id}`)}
                      className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
                    >
                      <Hammer className="w-3.5 h-3.5" /> Open
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-tertiary">
                    No production orders{statusFilter ? ` at ${ORDER_STATUS_LABEL[statusFilter as ProductionOrderStatus]}` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">New Production Order</h3>
            <p className="text-xs text-app-label-secondary">
              Uses the product's active BOM. For a custom piece, clone and adapt a BOM on the Products
              page first.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              <input
                type="text" required placeholder="Order number — PO-1042"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
              <select
                required
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
              >
                <option value="">Select product…</option>
                {products?.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.active_bom ? `(BOM v${p.active_bom.version})` : "(no active BOM)"}
                  </option>
                ))}
              </select>
              <input
                type="number" min="1" placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating…" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
