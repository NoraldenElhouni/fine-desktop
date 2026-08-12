import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, RefreshCw, AlertTriangle, Trash2, Building2, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSalesOrders, useCreateSalesOrder } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { getClients } from "../../api/endpoints/clients";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { SALES_STATUS_ORDER, SALES_STATUS_LABEL, SalesOrderStatus } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface DraftLine {
  key: string;
  item: string;
  qty: string;
  price: string;
}

const newLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  item: "",
  qty: "1",
  price: "",
});

export const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderNumber, setOrderNumber] = useState("");
  const [buyerType, setBuyerType] = useState<"client" | "internal_unit">("client");
  const [clientId, setClientId] = useState("");
  const [buyerUnitId, setBuyerUnitId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);

  const { data, isLoading, refetch } = useSalesOrders({ status: statusFilter || undefined });
  const { data: items } = useInventoryItems({});
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => getClients() });
  const { data: units } = useQuery({ queryKey: ["operatingUnits"], queryFn: () => getOperatingUnits() });
  const createMutation = useCreateSalesOrder();

  const orders = data?.data ?? [];
  const orderTotal = lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);

  const selectedClient = clients?.find((c) => c.id === clientId);

  const canSubmit =
    orderNumber !== "" &&
    (buyerType === "client" ? clientId !== "" : buyerUnitId !== "") &&
    lines.length > 0 &&
    lines.every((l) => l.item && num(l.qty) > 0 && num(l.price) >= 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        order_number: orderNumber,
        buyer_type: buyerType,
        client_id: buyerType === "client" ? clientId : undefined,
        buyer_unit_id: buyerType === "internal_unit" ? buyerUnitId : undefined,
        lines: lines.map((l) => ({
          inventory_item_id: l.item,
          quantity: num(l.qty),
          unit_price: num(l.price),
        })),
      },
      {
        onSuccess: (res) => {
          setShowForm(false);
          navigate(`/sales/orders/${res.data.id}`);
        },
        onError: (err: unknown) => {
          const payload = apiErrorPayload(err);
          setError(payload?.errors?.order_number?.[0] ?? payload?.message ?? "Could not create the order.");
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-app-accent" />
            Sales Orders
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Client sales pass the credit gate on submit; internal transfers skip it and move at cost.
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

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary p-3 shadow-sm">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            statusFilter === "" ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
          }`}
        >
          All
        </button>
        {SALES_STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusFilter === s ? "bg-app-accent text-white" : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`}
          >
            {SALES_STATUS_LABEL[s]}
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
                <th className="px-4 py-3 text-start">Buyer</th>
                <th className="px-4 py-3 text-start">Channel</th>
                <th className="px-4 py-3 text-start">Total</th>
                <th className="px-4 py-3 text-start">Paid</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{o.order_number}</td>
                  <td className="px-4 py-3">
                    {o.buyer_type === "client" ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {o.client?.entity?.name ?? "Client"}
                      </span>
                    ) : o.buyer_type === "internal_unit" ? (
                      <span className="inline-flex items-center gap-1 text-app-label-secondary">
                        <Home className="w-3.5 h-3.5" /> {o.buyer_unit?.name ?? "Internal"}
                      </span>
                    ) : (
                      <span className="text-app-label-tertiary">Walk-in</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-app-label-secondary">{o.channel}</td>
                  <td className="px-4 py-3 font-mono">{Number(o.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {Number(o.amount_paid).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        o.status === "pending_approval"
                          ? "bg-app-status-yellow/15 text-app-status-yellow"
                          : o.status === "rejected"
                            ? "bg-app-status-danger/10 text-app-status-danger"
                            : "bg-app-accent-subtle text-app-accent"
                      }`}
                    >
                      {SALES_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => navigate(`/sales/orders/${o.id}`)}
                      className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-tertiary">
                    No sales orders{statusFilter ? ` at ${SALES_STATUS_LABEL[statusFilter as SalesOrderStatus]}` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-2xl w-full p-6 border border-app-separator shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-app-label-primary">New Sales Order</h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text" required placeholder="Order number — SO-1042"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyerType("client")}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                      buyerType === "client"
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                    }`}
                  >
                    External Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyerType("internal_unit")}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                      buyerType === "internal_unit"
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                    }`}
                  >
                    Internal Unit
                  </button>
                </div>
              </div>

              {buyerType === "client" ? (
                <div>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                  >
                    <option value="">Select client…</option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {(c as { entity?: { name?: string } }).entity?.name ?? c.id}
                      </option>
                    ))}
                  </select>
                  {selectedClient && (
                    <p className="text-[10px] text-app-label-tertiary mt-1 font-mono">
                      Credit limit {Number((selectedClient as { credit_limit?: number }).credit_limit ?? 0).toLocaleString()}
                      {" · "}balance {Number((selectedClient as { current_balance?: number }).current_balance ?? 0).toLocaleString()}
                      {" · "}this order {orderTotal.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <select
                    required
                    value={buyerUnitId}
                    onChange={(e) => setBuyerUnitId(e.target.value)}
                    className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                  >
                    <option value="">Select buying unit…</option>
                    {units?.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    Internal transfers skip the credit gate and settle at cost.
                  </p>
                </div>
              )}

              {/* Lines */}
              <div className="space-y-2">
                {lines.map((l) => (
                  <div key={l.key} className="flex gap-2 items-center">
                    <select
                      value={l.item}
                      onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, item: e.target.value } : x))}
                      className="flex-1 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                    >
                      <option value="">Item…</option>
                      {items?.data.map((i) => (
                        <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                      ))}
                    </select>
                    <input
                      type="number" step="0.01" min="0.01" placeholder="qty"
                      value={l.qty}
                      onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, qty: e.target.value } : x))}
                      className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                    <input
                      type="number" step="0.01" min="0" placeholder="price"
                      value={l.price}
                      onChange={(e) => setLines(lines.map((x) => x.key === l.key ? { ...x, price: e.target.value } : x))}
                      className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                    <span className="w-20 text-end text-xs font-mono text-app-label-secondary">
                      {(num(l.qty) * num(l.price)).toLocaleString()}
                    </span>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLines(lines.filter((x) => x.key !== l.key))}
                        className="p-1 rounded-lg text-app-label-tertiary hover:text-app-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setLines([...lines, newLine()])}
                    className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:opacity-80"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add line
                  </button>
                  <span className="text-sm font-bold font-mono text-app-label-primary">
                    Total {orderTotal.toLocaleString()} LYD
                  </span>
                </div>
              </div>

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
                  disabled={createMutation.isPending || !canSubmit}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating…" : "Create Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
