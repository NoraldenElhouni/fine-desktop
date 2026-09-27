import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Banknote, Boxes, Building2, FileText, Package, ShoppingCart, Truck, UserRound,
} from "lucide-react";
import { useCollectPayment, useSale, usePaymentAccounts } from "../../hooks/useSales";
import { FULFILLMENT_LABEL, PAYMENT_METHOD_LABEL, SALE_STATUS_LABEL, formatSizeCm } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatDateTime, formatNumber } from "../../lib/utils/format";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { toast } from "../../stores/toastStore";
import { SaleInvoiceDialog, DeliveryNoteDialog } from "../../components/print/SalesDocuments";

export const SaleDetailPage: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();

  const { data: sale, isLoading } = useSale(saleId);
  const { data: treasuries = [] } = usePaymentAccounts();
  const collectPayment = useCollectPayment();

  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "bank">("cash");
  const [cashAccountId, setCashAccountId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState(false);

  if (isLoading || !sale) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">
        جاري تحميل البيع…
      </div>
    );
  }

  const outstanding = Number(sale.total_amount) - Number(sale.amount_paid);
  const isReceivable = sale.payment_method === "receivable";
  const bundleLines = (sale.lines ?? []).filter((l) => l.line_type === "bundle");
  const availableTreasuries = treasuries.filter((a) => a.kind === method && a.account_id);

  const collect = () => {
    setError(null);
    if (!cashAccountId) return;
    collectPayment.mutate(
      { id: sale.id, amount: Number(amount), method, cash_account_id: cashAccountId },
      {
        onSuccess: () => { setAmount(""); toast.success("تم تسجيل التحصيل"); },
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذّر تسجيل التحصيل."),
      },
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button onClick={() => navigate("/sales")} className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2">
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى المبيعات
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{sale.order_number}</span>
          <StatusBadge status={sale.status} label={SALE_STATUS_LABEL[sale.status]} />
          {sale.fulfillment_status && (
            <span className="flex items-center gap-1 text-xs font-semibold text-app-label-secondary">
              <Truck className="w-3.5 h-3.5" /> {FULFILLMENT_LABEL[sale.fulfillment_status]}
            </span>
          )}
        </h1>
        <p className="text-xs text-app-label-secondary mt-1 flex items-center gap-1.5">
          {sale.buyer_type === "internal_unit" ? (
            <><Building2 className="w-3.5 h-3.5" /> تحويل داخلي إلى {sale.buyer_unit?.name ?? "—"}</>
          ) : (
            <><UserRound className="w-3.5 h-3.5" /> {sale.client?.entity?.name ?? "—"}</>
          )}
          {" · "}{formatDateTime(sale.created_at)}
          {sale.sold_by && ` · باعه ${sale.sold_by.name}`}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">{error}</div>
      )}

      {sale.status === "pending_approval" && sale.credit_approval_request && (
        <div className="rounded-2xl border border-app-status-warning/40 bg-app-status-warning/5 p-4 text-xs text-app-label-primary">
          هذا البيع يتجاوز سقف ائتمان العميل بمقدار{" "}
          <span className="font-mono font-bold">{formatNumber(sale.credit_approval_request.amount_over_limit)}</span> ولم يُصرف بعد؛
          راجع تبويب «الموافقات».
        </div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs text-app-label-secondary">
          الإجمالي <span className="font-mono font-bold text-app-label-primary">{formatNumber(sale.total_amount)}</span>
          {" · "}المدفوع <span className="font-mono">{formatNumber(sale.amount_paid)}</span>
          {outstanding > 0.001 && (
            <> · المتبقي <span className="font-mono font-bold text-app-status-danger">{formatNumber(outstanding)}</span></>
          )}
        </div>
        <div className="ms-auto flex flex-wrap gap-2">
          {bundleLines.map((line) => (
            <button
              key={line.id}
              onClick={() => navigate(`/sales/${sale.id}/bundles/${line.id}`)}
              className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/15"
            >
              <Boxes className="w-4 h-4" /> {line.description} — تجهيز القطع
            </button>
          ))}
          <button
            onClick={() => setShowInvoice(true)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <FileText className="w-4 h-4" /> فاتورة
          </button>
          <button
            onClick={() => setShowDeliveryNote(true)}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
          >
            <Truck className="w-4 h-4" /> إذن استلام
          </button>
        </div>
      </div>

      {isReceivable && outstanding > 0.001 && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <Banknote className="w-4 h-4 text-app-accent" /> تحصيل دفعة
          </h2>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex gap-1.5">
              {(["cash", "bank"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setCashAccountId(""); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border ${method === m ? "border-app-accent bg-app-accent text-white" : "border-app-separator bg-app-bg-secondary text-app-label-secondary"}`}
                >
                  {PAYMENT_METHOD_LABEL[m]}
                </button>
              ))}
            </div>
            <select
              value={cashAccountId}
              onChange={(e) => setCashAccountId(e.target.value)}
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs"
            >
              <option value="">اختر الخزينة/الحساب…</option>
              {availableTreasuries.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input
              type="number" min="0.01" max={outstanding} step="0.01"
              placeholder={`المتبقي ${formatNumber(outstanding)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-40 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono"
            />
            <button
              onClick={collect}
              disabled={collectPayment.isPending || !cashAccountId || Number(amount) <= 0}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {collectPayment.isPending ? "جارٍ التسجيل…" : "تسجيل التحصيل"}
            </button>
          </div>
          {sale.payments && sale.payments.length > 0 && (
            <ul className="text-[11px] text-app-label-secondary space-y-1">
              {sale.payments.map((p) => (
                <li key={p.id} className="font-mono">
                  {formatDateTime(p.received_at)} — {formatNumber(p.amount)} ({p.cash_account?.name ?? p.method})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">بنود البيع</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
              <th className="px-4 py-2 text-start font-semibold">البيان</th>
              <th className="px-3 py-2 text-center font-semibold">الكمية</th>
              <th className="px-3 py-2 text-end font-semibold">السعر</th>
              <th className="px-3 py-2 text-end font-semibold">الإجمالي</th>
              <th className="px-3 py-2 text-end font-semibold">التكلفة الفعلية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator">
            {(sale.lines ?? []).map((line) => {
              const size = formatSizeCm(line.length_m, line.width_m, line.height_m);
              return (
                <tr key={line.id}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {line.line_type === "bundle" && <Boxes className="h-3.5 w-3.5 text-app-accent" />}
                      {line.description ?? line.inventory_item?.name}
                    </div>
                    <div className="text-[10px] text-app-label-tertiary font-mono">
                      {[line.inventory_item?.code, size, line.stock_lot ? `لوت ${line.stock_lot.lot_number}` : null].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">{formatNumber(line.quantity)}</td>
                  <td className="px-3 py-2.5 text-end font-mono">{formatNumber(line.unit_price)}</td>
                  <td className="px-3 py-2.5 text-end font-mono font-bold">{formatNumber(Number(line.quantity) * Number(line.unit_price))}</td>
                  <td className="px-3 py-2.5 text-end font-mono text-app-label-secondary">
                    {Number(line.unit_cost_actual) > 0 ? formatNumber(line.unit_cost_actual) : "—"}
                  </td>
                </tr>
              );
            })}
            {(!sale.lines || sale.lines.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-app-label-secondary">
                  <Package className="mx-auto mb-2 h-6 w-6 text-app-label-tertiary" />
                  لا توجد بنود.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SaleInvoiceDialog saleId={showInvoice ? sale.id : null} onClose={() => setShowInvoice(false)} />
      <DeliveryNoteDialog saleId={showDeliveryNote ? sale.id : null} onClose={() => setShowDeliveryNote(false)} />
    </div>
  );
};
