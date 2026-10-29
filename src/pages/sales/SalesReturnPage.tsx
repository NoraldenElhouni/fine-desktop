import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Boxes, Building2, Package, Undo2, UserRound } from "lucide-react";
import { useCreateSalesReturn, useReturnableLines, useSale } from "../../hooks/useSales";
import {
  REFUND_METHOD_LABEL,
  RETURN_CONDITION_LABEL,
  RefundMethod,
  ReturnCondition,
  SALES_ERROR_MESSAGE,
  SALES_RETURN_ROLES,
  SaleErrorPayload,
  SalesReturn,
} from "../../api/endpoints/sales";
import { apiErrorMessage, apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { toast } from "../../stores/toastStore";
import { TreasurySelect } from "../../components/treasury/TreasurySelect";
import { SalesReturnReceiptModal } from "../../components/print/SalesReturnDocuments";

interface LineEntry {
  qty: string;
  condition: ReturnCondition;
}

/** Raise a return against one sale: pick quantities per line, then how the customer is refunded. */
export const SalesReturnPage: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const { hasRole, hasPermission } = usePermissions();
  const canReturn = hasRole(SALES_RETURN_ROLES) && hasPermission("create-sales-returns");

  const { data: sale, isLoading: saleLoading, error: saleError } = useSale(saleId);
  const { data: returnable, isLoading: linesLoading, error: linesError } = useReturnableLines(saleId);
  const createReturn = useCreateSalesReturn();

  const [entries, setEntries] = useState<Record<string, LineEntry>>({});
  const [refundChoice, setRefundChoice] = useState<RefundMethod | null>(null);
  const [cashAccountId, setCashAccountId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SalesReturn | null>(null);

  const lines = useMemo(() => returnable?.lines ?? [], [returnable]);

  if (saleLoading || linesLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">
        جاري تحميل البيع…
      </div>
    );
  }

  if (!sale || !returnable) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-status-danger" dir="rtl">
        {apiErrorMessage(saleError ?? linesError, "تعذّر تحميل البيع.")}
      </div>
    );
  }

  const hasClient = Boolean(sale.client_id);
  const defaultMethod: RefundMethod = hasClient && sale.payment_method === "receivable" ? "credit" : "cash";
  const refundMethod: RefundMethod = refundChoice ?? defaultMethod;
  const refundable = Number(returnable.refundable_amount ?? sale.amount_paid ?? 0);

  const buyerName =
    sale.buyer_type === "walk_in"
      ? sale.walk_in_name?.trim() || "زبون عام"
      : sale.buyer_type === "internal_unit"
        ? sale.buyer_unit?.name ?? "وحدة داخلية"
        : sale.client?.entity?.name ?? "عميل";

  const entryFor = (lineId: string): LineEntry => entries[lineId] ?? { qty: "", condition: "restock" };
  const setEntry = (lineId: string, patch: Partial<LineEntry>) =>
    setEntries((prev) => ({ ...prev, [lineId]: { ...entryFor(lineId), ...patch } }));

  const lineState = lines.map((line) => {
    const entry = entryFor(line.sales_order_line_id);
    const raw = entry.qty.trim();
    const qty = raw === "" ? 0 : Number(raw);
    // Items sell by any quantity (length, weight…), so any amount up to what is left can come back.
    const valid = raw === "" || (!isNaN(qty) && qty >= 0 && qty <= line.remaining_qty + 0.0001);
    return { line, entry, qty: valid && line.returnable ? qty : 0, valid };
  });

  const chosen = lineState.filter((s) => s.line.returnable && s.qty > 0);
  const allValid = lineState.every((s) => s.valid);
  // An estimate: net_unit_amount arrives rounded to 4 places, and the backend prices a line's last
  // units as exactly what is left of its net. So only block when the estimate clears the paid amount
  // by more than that rounding could explain; the backend's RETURN_REFUND_METHOD_INVALID is final.
  const total = chosen.reduce((sum, s) => sum + s.qty * Number(s.line.net_unit_amount), 0);
  const roundingSlack = 0.005 + chosen.reduce((sum, s) => sum + s.qty * 0.00005, 0);
  const overRefundable = refundMethod !== "credit" && total > refundable + roundingSlack;
  const refundValid =
    refundMethod === "credit" ? hasClient : Boolean(cashAccountId) && !overRefundable;
  const canSubmit = canReturn && chosen.length > 0 && allValid && refundValid && !createReturn.isPending;

  const chooseMethod = (m: RefundMethod) => {
    setRefundChoice(m);
    setCashAccountId("");
  };

  const submit = () => {
    setError(null);
    if (!canSubmit || !saleId) return;

    createReturn.mutate(
      {
        saleId,
        lines: chosen.map((s) => ({
          sales_order_line_id: s.line.sales_order_line_id,
          quantity: s.qty,
          condition: s.entry.condition,
        })),
        refund_method: refundMethod,
        cash_account_id: refundMethod === "credit" ? null : cashAccountId,
        reason: reason.trim() || null,
      },
      {
        onSuccess: (salesReturn) => {
          toast.success(`تم تسجيل المرتجع ${salesReturn.number}`);
          setCreated(salesReturn);
        },
        onError: (err) => {
          const payload = apiErrorPayload(err) as (SaleErrorPayload & { amount_paid?: number; available?: number }) | undefined;
          if (payload?.code === "RETURN_REFUND_METHOD_INVALID" && payload.amount_paid !== undefined) {
            setError(`مبلغ الرد يتجاوز المدفوع على هذا البيع (${formatNumber(payload.amount_paid)} د.ل) — أعد الباقي كرصيد للعميل.`);
            return;
          }
          if (payload?.code === "TREASURY_INSUFFICIENT_BALANCE") {
            setError(
              `رصيد الخزينة لا يكفي لهذا الرد${payload.available !== undefined ? ` (المتاح ${formatNumber(payload.available)} د.ل)` : ""}.`,
            );
            return;
          }
          setError((payload?.code && SALES_ERROR_MESSAGE[payload.code]) || apiErrorMessage(err, "تعذّر تسجيل المرتجع."));
        },
      },
    );
  };

  const methods: { id: RefundMethod; show: boolean }[] = [
    { id: "cash", show: true },
    { id: "bank", show: true },
    { id: "credit", show: hasClient },
  ];

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button
          onClick={() => navigate(`/sales/${sale.id}`)}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى البيع
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Undo2 className="w-7 h-7 text-app-accent" />
          مرتجع على البيع
          <span className="font-mono text-app-accent">{sale.order_number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1 flex items-center gap-1.5">
          {sale.buyer_type === "internal_unit" ? <Building2 className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}
          {buyerName}
        </p>
      </div>

      {!canReturn && (
        <div className="rounded-2xl border border-app-status-warning/40 bg-app-status-warning/5 p-4 text-xs text-app-label-primary">
          ليست لديك صلاحية تسجيل المرتجعات.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">{error}</div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">البنود القابلة للإرجاع</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
              <th className="px-4 py-2 text-start font-semibold">البيان</th>
              <th className="px-3 py-2 text-center font-semibold">المباع</th>
              <th className="px-3 py-2 text-center font-semibold">المرتجع سابقاً</th>
              <th className="px-3 py-2 text-center font-semibold">المتبقي</th>
              <th className="px-3 py-2 text-end font-semibold">صافي الوحدة</th>
              <th className="px-3 py-2 text-center font-semibold">الكمية المرتجعة</th>
              <th className="px-3 py-2 text-start font-semibold">الحالة</th>
              <th className="px-3 py-2 text-end font-semibold">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator">
            {lineState.map(({ line, entry, qty, valid }) => {
              const isBundle = line.line_type === "bundle";
              const disabled = !line.returnable || line.remaining_qty <= 0;
              return (
                <tr key={line.sales_order_line_id} className={!line.returnable ? "opacity-50" : undefined}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {isBundle && <Boxes className="h-3.5 w-3.5 text-app-accent" />}
                      {line.description ?? "—"}
                    </div>
                    {line.item_code && <div className="text-[10px] text-app-label-tertiary font-mono">{line.item_code}</div>}
                    {isBundle && <div className="text-[10px] text-app-label-secondary">الحزم لا تُرجع في هذا الإصدار</div>}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">{formatNumber(line.sold_qty, { maximumFractionDigits: 4 })}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-app-label-secondary">
                    {line.returned_qty > 0 ? formatNumber(line.returned_qty, { maximumFractionDigits: 4 }) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-bold">{formatNumber(line.remaining_qty, { maximumFractionDigits: 4 })}</td>
                  <td className="px-3 py-2.5 text-end font-mono">{formatNumber(line.net_unit_amount)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="number"
                      min={0}
                      max={line.remaining_qty}
                      step="any"
                      value={entry.qty}
                      disabled={disabled}
                      placeholder="0"
                      onChange={(e) => setEntry(line.sales_order_line_id, { qty: e.target.value })}
                      className={`w-24 px-2 py-1.5 border rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:outline-none disabled:opacity-50 ${
                        valid ? "border-app-separator focus:border-app-accent" : "border-app-status-danger"
                      }`}
                      dir="ltr"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={entry.condition}
                      disabled={disabled}
                      onChange={(e) => setEntry(line.sales_order_line_id, { condition: e.target.value as ReturnCondition })}
                      className="rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs focus:border-app-accent focus:outline-none disabled:opacity-50"
                    >
                      {(Object.keys(RETURN_CONDITION_LABEL) as ReturnCondition[]).map((c) => (
                        <option key={c} value={c}>{RETURN_CONDITION_LABEL[c]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-end font-mono font-bold">
                    {qty > 0 ? formatNumber(qty * Number(line.net_unit_amount)) : "—"}
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-app-label-secondary">
                  <Package className="mx-auto mb-2 h-6 w-6 text-app-label-tertiary" />
                  لا توجد بنود.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-app-label-primary">طريقة الرد</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-1.5">
              {methods.filter((m) => m.show).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => chooseMethod(m.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    refundMethod === m.id
                      ? "border-app-accent bg-app-accent text-white"
                      : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                  }`}
                >
                  {REFUND_METHOD_LABEL[m.id]}
                </button>
              ))}
            </div>
            {refundMethod !== "credit" && (
              <TreasurySelect
                key={refundMethod}
                kind={refundMethod}
                value={cashAccountId}
                onChange={setCashAccountId}
                label={refundMethod === "bank" ? "الحساب المصرفي" : "الخزينة"}
                className="w-72 space-y-1"
              />
            )}
          </div>
          {refundMethod === "credit" && (
            <p className="text-[11px] text-app-label-secondary">يُخصم المبلغ من رصيد العميل المستحق.</p>
          )}
          {overRefundable && (
            <p className="text-[11px] text-app-status-danger">
              المبلغ يتجاوز المدفوع على هذا البيع ({formatNumber(refundable)} د.ل)
              {hasClient ? " — أعد الباقي كرصيد للعميل." : "."}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-app-label-secondary">سبب الإرجاع (اختياري)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-separator pt-3">
          <div className="text-sm text-app-label-secondary">
            إجمالي المرتجع:{" "}
            <span className="font-mono text-lg font-bold text-app-label-primary">{formatNumber(total)}</span> د.ل
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Undo2 className="h-4 w-4" />
            {createReturn.isPending ? "جارٍ التسجيل…" : "تأكيد المرتجع"}
          </button>
        </div>
      </div>

      <SalesReturnReceiptModal
        salesReturn={created}
        buyerName={buyerName}
        onClose={() => {
          setCreated(null);
          navigate(`/sales/${sale.id}`);
        }}
      />
    </div>
  );
};
