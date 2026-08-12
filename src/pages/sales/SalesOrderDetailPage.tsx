import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, ShoppingCart, AlertTriangle, Send, PackageCheck, Banknote, CheckCircle2,
  ShieldAlert, FileText,
} from "lucide-react";
import {
  useSalesOrder, useSubmitOrder, useFulfillOrder, useRecordPayment, useCompleteOrder,
  useDecideCredit, useInvoice,
} from "../../hooks/useSales";
import { SALES_STATUS_LABEL } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";

export const SalesOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useSalesOrder(orderId);
  const submitMutation = useSubmitOrder();
  const fulfillMutation = useFulfillOrder();
  const paymentMutation = useRecordPayment();
  const completeMutation = useCompleteOrder();
  const creditMutation = useDecideCredit();

  const [error, setError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);

  const invoiceEnabled = Boolean(order && ["fulfilled", "partially_paid", "paid", "completed"].includes(order.status));
  const { data: invoice } = useInvoice(orderId, invoiceEnabled && showInvoice);

  if (isLoading || !order) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        Loading order…
      </div>
    );
  }

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const outstanding = Number(order.total_amount) - Number(order.amount_paid);
  const approval = order.credit_approval_request;

  return (
    <div className="space-y-6 p-6">
      <div>
        <button
          onClick={() => navigate("/sales/orders")}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Back to orders
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{order.order_number}</span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
            {SALES_STATUS_LABEL[order.status]}
          </span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          {order.buyer_type === "client"
            ? `Client: ${order.client?.entity?.name ?? "—"}`
            : order.buyer_type === "internal_unit"
              ? `Internal transfer to ${order.buyer_unit?.name ?? "—"}`
              : "Walk-in"}
          {" · "}total <span className="font-mono font-bold">{Number(order.total_amount).toLocaleString()}</span>
          {order.status !== "draft" && (
            <>
              {" · "}paid <span className="font-mono">{Number(order.amount_paid).toLocaleString()}</span>
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Credit escalation */}
      {order.status === "pending_approval" && approval && (
        <div className="rounded-2xl border border-app-status-yellow/40 bg-app-status-yellow/5 p-4 space-y-3">
          <div className="flex items-start gap-2 text-xs text-app-label-primary">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-app-status-yellow" />
            <span>
              This order takes the client{" "}
              <span className="font-mono font-bold">
                {Number(approval.amount_over_limit).toLocaleString()}
              </span>{" "}
              over their credit limit. It stays blocked until someone with the authority decides.
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => creditMutation.mutate(
                { approvalId: approval.id, approve: true },
                { onError: (e) => fail(e, "Could not approve.") },
              )}
              disabled={creditMutation.isPending}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              Approve Over-Limit
            </button>
            <button
              onClick={() => creditMutation.mutate(
                { approvalId: approval.id, approve: false },
                { onError: (e) => fail(e, "Could not reject.") },
              )}
              disabled={creditMutation.isPending}
              className="rounded-xl border border-app-status-danger/40 px-4 py-2 text-xs font-bold text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-50"
            >
              Reject Order
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 flex flex-wrap items-center gap-2">
        {order.status === "draft" && (
          <button
            onClick={() => { setError(null); submitMutation.mutate(orderId as string, { onError: (e) => fail(e, "Submit failed.") }); }}
            disabled={submitMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {order.buyer_type === "client" ? "Submit for Credit Check" : "Submit"}
          </button>
        )}

        {order.status === "confirmed" && (
          <button
            onClick={() => { setError(null); fulfillMutation.mutate(orderId as string, { onError: (e) => fail(e, "Fulfillment failed.") }); }}
            disabled={fulfillMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            <PackageCheck className="w-4 h-4" /> Fulfill — Issue Goods
          </button>
        )}

        {["fulfilled", "partially_paid"].includes(order.status) && order.buyer_type !== "internal_unit" && (
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.01" min="0.01" max={outstanding}
              placeholder={`Outstanding ${outstanding.toLocaleString()}`}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-44 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
            />
            <button
              onClick={() => {
                setError(null);
                paymentMutation.mutate(
                  { id: orderId as string, amount: Number(paymentAmount) },
                  { onSuccess: () => setPaymentAmount(""), onError: (e) => fail(e, "Payment failed.") },
                );
              }}
              disabled={paymentMutation.isPending || Number(paymentAmount) <= 0}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" /> Record Payment
            </button>
          </div>
        )}

        {order.status === "fulfilled" && order.buyer_type === "internal_unit" && (
          <button
            onClick={() => { setError(null); completeMutation.mutate(orderId as string, { onError: (e) => fail(e, "Completion failed.") }); }}
            disabled={completeMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete Transfer
          </button>
        )}

        {invoiceEnabled && (
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="ms-auto flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <FileText className="w-4 h-4" /> {showInvoice ? "Hide Invoice" : "View Invoice"}
          </button>
        )}

        {order.status === "paid" && (
          <span className="flex items-center gap-1 text-xs font-semibold text-app-status-positive">
            <CheckCircle2 className="w-4 h-4" /> Settled in full
          </span>
        )}
      </div>

      {/* Invoice */}
      {showInvoice && invoice && (
        <div className="rounded-2xl border border-app-accent/40 bg-app-accent-tint p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-app-label-primary font-mono">{invoice.invoice_number}</div>
              <div className="text-xs text-app-label-secondary">
                {invoice.date} · {invoice.seller} → {invoice.buyer}
              </div>
            </div>
            <div className="text-end">
              <div className="text-lg font-bold font-mono text-app-label-primary">
                {invoice.total_amount.toLocaleString()} LYD
              </div>
              <div className="text-xs text-app-label-secondary font-mono">
                outstanding {invoice.outstanding.toLocaleString()}
              </div>
            </div>
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-app-separator/50">
              {invoice.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5">{l.item} <span className="text-app-label-tertiary font-mono">{l.sku}</span></td>
                  <td className="py-1.5 text-end font-mono">{l.quantity} × {l.unit_price.toLocaleString()}</td>
                  <td className="py-1.5 text-end font-mono font-bold">{l.line_total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lines */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">Lines</h2>
        </div>
        <table className="w-full text-start text-xs">
          <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
            <tr>
              <th className="px-4 py-2 text-start">Item</th>
              <th className="px-4 py-2 text-end">Qty</th>
              <th className="px-4 py-2 text-end">Price</th>
              <th className="px-4 py-2 text-end">Total</th>
              <th className="px-4 py-2 text-end">Actual Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator text-app-label-primary">
            {order.lines?.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2">
                  {l.inventory_item?.name}
                  <span className="text-app-label-tertiary font-mono ms-2">{l.inventory_item?.sku}</span>
                </td>
                <td className="px-4 py-2 text-end font-mono">{Number(l.quantity)}</td>
                <td className="px-4 py-2 text-end font-mono">{Number(l.unit_price).toLocaleString()}</td>
                <td className="px-4 py-2 text-end font-mono font-bold">
                  {(Number(l.quantity) * Number(l.unit_price)).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-end font-mono text-app-label-secondary">
                  {Number(l.unit_cost_actual) > 0 ? Number(l.unit_cost_actual).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
