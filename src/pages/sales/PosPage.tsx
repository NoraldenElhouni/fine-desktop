import React, { useMemo, useState } from "react";
import { Store, Plus, Trash2, Banknote, CreditCard, AlertTriangle, CheckCircle2, Receipt } from "lucide-react";
import { usePosCheckout, usePosDailyReport } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { SalesOrder } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface CartLine {
  key: string;
  item: string;
  name: string;
  qty: string;
  price: string;
}

export const PosPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SalesOrder | null>(null);

  const { data: items } = useInventoryItems({ search: search || undefined });
  const { data: report } = usePosDailyReport();
  const checkout = usePosCheckout();

  const total = useMemo(() => cart.reduce((s, l) => s + num(l.qty) * num(l.price), 0), [cart]);
  const change = num(cashReceived) - total;

  const addToCart = (id: string, name: string) => {
    const existing = cart.find((l) => l.item === id);
    if (existing) {
      setCart(cart.map((l) => l.item === id ? { ...l, qty: String(num(l.qty) + 1) } : l));
    } else {
      setCart([...cart, { key: Math.random().toString(36).slice(2), item: id, name, qty: "1", price: "" }]);
    }
  };

  const submit = () => {
    setError(null);
    checkout.mutate(
      {
        order_number: "POS-" + Date.now(),
        payment_method: method,
        items: cart.map((l) => ({
          inventory_item_id: l.item,
          quantity: num(l.qty),
          unit_price: num(l.price),
        })),
      },
      {
        onSuccess: (res) => {
          setReceipt(res.data);
          setCart([]);
          setCashReceived("");
        },
        onError: (err: unknown) => setError(apiErrorPayload(err)?.message ?? "Checkout failed."),
      },
    );
  };

  const canCheckout =
    cart.length > 0 &&
    cart.every((l) => num(l.qty) > 0 && num(l.price) > 0) &&
    (method === "card" || num(cashReceived) >= total);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Store className="w-7 h-7 text-app-accent" />
            POS — Counter Sale
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            One step: goods out, money in, receipt back. Credit sales go through a standard order.
          </p>
        </div>
        {report && (
          <div className="rounded-2xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs shadow-sm">
            <span className="text-app-label-secondary">Today: </span>
            <span className="font-mono font-bold text-app-label-primary">
              {report.sales_count} sales · {Number(report.total).toLocaleString()} LYD
            </span>
            {Object.entries(report.by_method).map(([m, v]) => (
              <span key={m} className="ms-2 text-app-label-tertiary font-mono">
                {m}: {Number(v.total).toLocaleString()}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {receipt && (
        <div className="rounded-2xl border border-app-status-positive/40 bg-app-status-positive/5 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <CheckCircle2 className="w-5 h-5 text-app-status-positive" />
            Sale {receipt.order_number} complete — {Number(receipt.total_amount).toLocaleString()} LYD ({receipt.payment_method})
            <button
              onClick={() => setReceipt(null)}
              className="ms-auto flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
            >
              <Receipt className="w-3.5 h-3.5" /> New Sale
            </button>
          </div>
          <div className="mt-2 text-xs text-app-label-secondary font-mono">
            {receipt.lines?.map((l) => (
              <div key={l.id}>
                {l.inventory_item?.name} × {Number(l.quantity)} @ {Number(l.unit_price).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product picker */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <div className="border-b border-app-separator p-3">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
            />
          </div>
          <div className="divide-y divide-app-separator max-h-96 overflow-y-auto">
            {items?.data.map((i) => (
              <button
                key={i.id}
                onClick={() => addToCart(i.id, i.name)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-start hover:bg-app-fill-f1 transition-colors"
              >
                <span className="text-xs font-semibold text-app-label-primary">{i.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-app-label-tertiary">{i.sku}</span>
                  <Plus className="w-4 h-4 text-app-accent" />
                </span>
              </button>
            ))}
            {items?.data.length === 0 && (
              <div className="p-8 text-center text-xs text-app-label-tertiary">No products found.</div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm flex flex-col">
          <div className="border-b border-app-separator px-4 py-3">
            <h2 className="text-sm font-bold text-app-label-primary">Cart</h2>
          </div>

          <div className="flex-1 divide-y divide-app-separator">
            {cart.map((l) => (
              <div key={l.key} className="flex items-center gap-2 px-4 py-2">
                <span className="flex-1 text-xs font-semibold text-app-label-primary">{l.name}</span>
                <input
                  type="number" min="1" step="1"
                  value={l.qty}
                  onChange={(e) => setCart(cart.map((x) => x.key === l.key ? { ...x, qty: e.target.value } : x))}
                  className="w-16 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <input
                  type="number" min="0" step="0.01" placeholder="price"
                  value={l.price}
                  onChange={(e) => setCart(cart.map((x) => x.key === l.key ? { ...x, price: e.target.value } : x))}
                  className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <span className="w-20 text-end text-xs font-mono font-bold">
                  {(num(l.qty) * num(l.price)).toLocaleString()}
                </span>
                <button
                  onClick={() => setCart(cart.filter((x) => x.key !== l.key))}
                  className="p-1 rounded-lg text-app-label-tertiary hover:text-app-status-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">
                Tap products to add them.
              </div>
            )}
          </div>

          <div className="border-t border-app-separator p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-app-label-primary">Total</span>
              <span className="text-xl font-bold font-mono text-app-accent">{total.toLocaleString()} LYD</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMethod("cash")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                  method === "cash"
                    ? "border-app-accent bg-app-accent text-white"
                    : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash
              </button>
              <button
                onClick={() => setMethod("card")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                  method === "card"
                    ? "border-app-accent bg-app-accent text-white"
                    : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
            </div>

            {method === "cash" && total > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="number" step="0.01" min="0"
                  placeholder="Cash received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="flex-1 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                />
                <span className={`text-xs font-mono font-bold ${change >= 0 ? "text-app-status-positive" : "text-app-status-danger"}`}>
                  {change >= 0 ? `Change ${change.toLocaleString()}` : `Short ${Math.abs(change).toLocaleString()}`}
                </span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canCheckout || checkout.isPending}
              className="w-full rounded-xl bg-app-accent px-4 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40"
            >
              {checkout.isPending ? "Processing…" : `Checkout — ${total.toLocaleString()} LYD`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
