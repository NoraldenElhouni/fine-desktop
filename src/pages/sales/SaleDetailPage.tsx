import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Banknote, Boxes, Building2, FileText, Package, ShieldCheck, ShoppingCart, Truck, Undo2, UserRound,
} from "lucide-react";
import { useCollectPayment, useSale, usePaymentAccounts } from "../../hooks/useSales";
import {
  FULFILLMENT_LABEL,
  PAYMENT_METHOD_LABEL,
  REFUND_METHOD_LABEL,
  SALE_STATUS_LABEL,
  SALES_RETURN_ROLES,
  PaymentMethod,
  SaleStatus,
  formatSizeCm,
} from "../../api/endpoints/sales";
import { apiErrorMessage } from "../../api/endpoints/production";
import { formatDate, formatDateTime, formatNumber, localDateIso } from "../../lib/utils/format";
import { usePermissions } from "../../hooks/usePermissions";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { toast } from "../../stores/toastStore";
import { SaleInvoiceDialog, DeliveryNoteDialog } from "../../components/print/SalesDocuments";
import { InstallmentScheduleSection } from "../../components/sales/InstallmentSchedule";

/** Backend-generated override reasons, in the user's language (PriceFloorGuard writes these in English). */
const PRICE_OVERRIDE_REASON_LABEL: Record<string, string> = {
  "approved by seller": "البائع يملك صلاحية البيع تحت الحد الأدنى",
};

/** Sales the backend will not take a return against (never sold: RETURN_SALE_NOT_COMPLETED). */
const NOT_RETURNABLE_STATUSES: SaleStatus[] = ["pending_approval", "rejected", "draft"];

export const SaleDetailPage: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const { hasRole, hasPermission } = usePermissions();
  const canCreateReturns = hasRole(SALES_RETURN_ROLES) && hasPermission("create-sales-returns");
  // W5-08: POST /sales/{id}/installment-plan sits in the POS group (create-sales for writes).
  const canAddInstallmentPlan = hasPermission("create-sales");

  const { data: sale, isLoading } = useSale(saleId);
  const { data: treasuries = [] } = usePaymentAccounts();
  const collectPayment = useCollectPayment();

  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "bank" | "cheque">("cash");
  const [cashAccountId, setCashAccountId] = useState("");
  const [tenderedAmount, setTenderedAmount] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [drawerName, setDrawerName] = useState("");
  const [dueDate, setDueDate] = useState(localDateIso());
  const [isCertified, setIsCertified] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState(false);

  if (isLoading || !sale) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">
        جاري تحميل البيع…
      </div>
    );
  }

  const returnedAmount = Number(sale.returned_amount || 0);
  // Returns lower what is still owed: total − returned − paid (cash/bank refunds already lowered amount_paid).
  const outstanding = Math.max(0, Number(sale.total_amount) - returnedAmount - Number(sale.amount_paid));
  const saleReturns = sale.returns ?? [];
  const showReturnButton =
    canCreateReturns && sale.buyer_type !== "internal_unit" && !NOT_RETURNABLE_STATUSES.includes(sale.status);
  const isReceivable = sale.payment_method === "receivable";
  const saleLines = sale.lines ?? [];
  const hasLineDiscount = saleLines.some((l) => Number(l.discount_amount || 0) > 0);
  const lineDiscountsSum = saleLines.reduce((s, l) => s + Number(l.discount_amount || 0), 0);
  const invoiceDiscount = Number(sale.invoice_discount || 0);
  const totalDiscount = lineDiscountsSum + invoiceDiscount;
  const grossAmount =
    sale.gross_amount !== undefined && sale.gross_amount !== null
      ? Number(sale.gross_amount)
      : Number(sale.total_amount) + totalDiscount;
  const hasAnyDiscount = totalDiscount > 0;
  const rawOverrideReason = sale.price_override_reason?.trim() ?? "";
  const overrideReason = PRICE_OVERRIDE_REASON_LABEL[rawOverrideReason] ?? rawOverrideReason;
  const bundleLines = saleLines.filter((l) => l.line_type === "bundle");
  const availableTreasuries = method === "cheque" ? [] : treasuries.filter((a) => a.kind === method && a.account_id);

  const numericAmount = Number(amount);
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= outstanding + 0.0001;
  const isCashTenderValid =
    method !== "cash" ||
    tenderedAmount.trim() === "" ||
    (!isNaN(Number(tenderedAmount)) && Number(tenderedAmount) >= numericAmount);

  const canCollect =
    isAmountValid &&
    !collectPayment.isPending &&
    (method === "cheque"
      ? chequeNo.trim() !== "" && bankName.trim() !== "" && dueDate.trim() !== ""
      : Boolean(cashAccountId) && isCashTenderValid);

  const handleMethodChange = (m: "cash" | "bank" | "cheque") => {
    setMethod(m);
    setCashAccountId("");
    setTenderedAmount("");
    if (m === "cheque" && !dueDate) {
      setDueDate(localDateIso());
    }
  };

  const collect = () => {
    setError(null);
    if (!canCollect) return;

    if (method === "cheque") {
      collectPayment.mutate(
        {
          id: sale.id,
          amount: numericAmount,
          method: "cheque",
          cheque: {
            cheque_no: chequeNo.trim(),
            bank_name: bankName.trim(),
            drawer_name: drawerName.trim() || undefined,
            due_date: dueDate,
            is_certified: isCertified,
          },
        },
        {
          onSuccess: () => {
            setAmount("");
            setChequeNo("");
            setBankName("");
            setDrawerName("");
            setIsCertified(false);
            toast.success("تم تسجيل التحصيل بالشيك بنجاح");
          },
          onError: (err) => {
            setError(apiErrorMessage(err, "تعذّر تسجيل التحصيل."));
          },
        },
      );
      return;
    }

    collectPayment.mutate(
      {
        id: sale.id,
        amount: numericAmount,
        method,
        cash_account_id: cashAccountId,
        tendered_amount:
          method === "cash" && tenderedAmount.trim() !== "" ? Number(tenderedAmount) : undefined,
      },
      {
        onSuccess: () => {
          setAmount("");
          setTenderedAmount("");
          toast.success("تم تسجيل التحصيل");
        },
        onError: (err) => {
          setError(apiErrorMessage(err, "تعذّر تسجيل التحصيل."));
        },
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
          {sale.price_tier === "wholesale" && (
            <span className="rounded-full bg-app-accent/15 px-2 py-0.5 text-xs font-bold text-app-accent">جملة</span>
          )}
          {sale.fulfillment_status && (
            <span className="flex items-center gap-1 text-xs font-semibold text-app-label-secondary">
              <Truck className="w-3.5 h-3.5" /> {FULFILLMENT_LABEL[sale.fulfillment_status]}
            </span>
          )}
        </h1>
        <p className="text-xs text-app-label-secondary mt-1 flex items-center gap-1.5">
          {sale.buyer_type === "internal_unit" ? (
            <><Building2 className="w-3.5 h-3.5" /> تحويل داخلي إلى {sale.buyer_unit?.name ?? "—"}</>
          ) : sale.buyer_type === "walk_in" ? (
            <>
              <UserRound className="w-3.5 h-3.5" />{" "}
              {sale.walk_in_name?.trim() || "زبون عام"}
              {sale.walk_in_phone?.trim() ? ` (${sale.walk_in_phone.trim()})` : ""}
            </>
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

      {sale.price_override_by && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-warning/40 bg-app-status-warning/5 p-4 text-xs text-app-label-primary">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-app-status-warning" />
          <span>
            سعر أقل من الحد الأدنى بموافقة: <span className="font-bold">{sale.price_override_by.name}</span>
            {overrideReason ? ` — ${overrideReason}` : ""}
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs text-app-label-secondary">
          {hasAnyDiscount ? (
            <>
              المجموع <span className="font-mono">{formatNumber(grossAmount)}</span>
              {" · "}الخصم <span className="font-mono text-app-status-warning">{formatNumber(totalDiscount)}</span>
              {" · "}الصافي <span className="font-mono font-bold text-app-label-primary">{formatNumber(sale.total_amount)}</span>
            </>
          ) : (
            <>
              الإجمالي <span className="font-mono font-bold text-app-label-primary">{formatNumber(sale.total_amount)}</span>
            </>
          )}
          {returnedAmount > 0.001 && (
            <> · المرتجع <span className="font-mono text-app-status-warning">{formatNumber(returnedAmount)}</span></>
          )}
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
          {showReturnButton && (
            <button
              onClick={() => navigate(`/sales/${sale.id}/return`)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
            >
              <Undo2 className="w-4 h-4" /> مرتجع
            </button>
          )}
        </div>
      </div>

      {isReceivable && outstanding > 0.001 && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <Banknote className="w-4 h-4 text-app-accent" /> تحصيل دفعة
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2.5">
              <div className="flex gap-1.5">
                {(
                  [
                    { id: "cash", label: "نقداً" },
                    { id: "bank", label: "مصرف" },
                    { id: "cheque", label: "شيك" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMethodChange(m.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      method === m.id
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {method !== "cheque" && (
                <select
                  value={cashAccountId}
                  onChange={(e) => setCashAccountId(e.target.value)}
                  className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
                >
                  <option value="">اختر الخزينة/الحساب…</option>
                  {availableTreasuries.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="number"
                min="0.01"
                max={outstanding}
                step="0.01"
                placeholder={`المبلغ المحصل (المتبقي ${formatNumber(outstanding)})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-44 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                dir="ltr"
              />

              {method === "cash" && (
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="المبلغ المستلم (اختياري)"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-40 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  dir="ltr"
                />
              )}

              {method === "cheque" && (
                <>
                  <input
                    type="text"
                    placeholder="رقم الشيك *"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    className="w-28 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="المصرف *"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-32 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="اسم الساحب (اختياري)"
                    value={drawerName}
                    onChange={(e) => setDrawerName(e.target.value)}
                    className="w-36 px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    title="تاريخ الاستحقاق *"
                    required
                  />
                  <label className="flex items-center gap-1.5 px-2 py-2 text-xs font-semibold text-app-label-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCertified}
                      onChange={(e) => setIsCertified(e.target.checked)}
                      className="rounded border-app-separator text-app-accent focus:ring-app-accent h-4 w-4"
                    />
                    شيك مصدق
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={collect}
                disabled={!canCollect}
                className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {collectPayment.isPending ? "جارٍ التسجيل…" : "تسجيل التحصيل"}
              </button>
            </div>

            {method === "cash" && tenderedAmount.trim() !== "" && isAmountValid && (
              <div className="text-xs">
                {Number(tenderedAmount) >= numericAmount ? (
                  <span className="text-app-status-positive font-semibold">
                    الباقي للعميل:{" "}
                    <span className="font-mono font-bold">
                      {formatNumber(Number(tenderedAmount) - numericAmount)}
                    </span>{" "}
                    د.ل
                  </span>
                ) : (
                  <span className="text-app-status-danger font-semibold">
                    المبلغ المستلم أقل من الدفعة المراد تحصيلها
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <InstallmentScheduleSection sale={sale} outstanding={outstanding} canAddPlan={canAddInstallmentPlan} />

      {sale.payments && sale.payments.length > 0 && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <Banknote className="w-4 h-4 text-app-accent" /> الدفعات
          </h2>
          <ul className="text-[11px] text-app-label-secondary space-y-1">
            {sale.payments.map((p) => {
              const methodLabel = p.method === "cheque" ? "شيك" : PAYMENT_METHOD_LABEL[p.method as PaymentMethod] ?? p.method;
              const isRefund = Boolean(p.sales_return_id) || Number(p.amount) < 0;
              return (
                <li key={p.id} className={`font-mono ${isRefund ? "text-app-status-warning" : ""}`}>
                  {formatDateTime(p.received_at)} — {isRefund && "استرداد "}
                  {formatNumber(Math.abs(Number(p.amount)))} ({p.cash_account?.name ?? methodLabel})
                </li>
              );
            })}
          </ul>
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
              {hasLineDiscount && <th className="px-3 py-2 text-end font-semibold">الخصم</th>}
              <th className="px-3 py-2 text-end font-semibold">الإجمالي</th>
              <th className="px-3 py-2 text-end font-semibold">التكلفة الفعلية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator">
            {saleLines.map((line) => {
              const size = formatSizeCm(line.length_m, line.width_m, line.height_m);
              const lineDiscount = Number(line.discount_amount || 0);
              const lineNet = Number(line.quantity) * Number(line.unit_price) - lineDiscount;
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
                  {hasLineDiscount && (
                    <td className="px-3 py-2.5 text-end font-mono text-app-label-secondary">
                      {lineDiscount > 0 ? formatNumber(lineDiscount) : "—"}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-end font-mono font-bold">{formatNumber(lineNet)}</td>
                  <td className="px-3 py-2.5 text-end font-mono text-app-label-secondary">
                    {Number(line.unit_cost_actual) > 0 ? formatNumber(line.unit_cost_actual) : "—"}
                  </td>
                </tr>
              );
            })}
            {saleLines.length === 0 && (
              <tr>
                <td colSpan={hasLineDiscount ? 6 : 5} className="px-4 py-10 text-center text-app-label-secondary">
                  <Package className="mx-auto mb-2 h-6 w-6 text-app-label-tertiary" />
                  لا توجد بنود.
                </td>
              </tr>
            )}
          </tbody>
          {hasAnyDiscount && (
            <tfoot className="border-t border-app-separator bg-app-bg-secondary/40 text-xs">
              <tr>
                <td colSpan={hasLineDiscount ? 4 : 3} className="px-4 py-2 text-end text-app-label-secondary">المجموع</td>
                <td className="px-3 py-2 text-end font-mono">{formatNumber(grossAmount)}</td>
                <td />
              </tr>
              <tr>
                <td colSpan={hasLineDiscount ? 4 : 3} className="px-4 py-2 text-end text-app-label-secondary">الخصم</td>
                <td className="px-3 py-2 text-end font-mono text-app-status-warning">-{formatNumber(totalDiscount)}</td>
                <td />
              </tr>
              <tr>
                <td colSpan={hasLineDiscount ? 4 : 3} className="px-4 py-2 text-end font-bold text-app-label-primary">الصافي</td>
                <td className="px-3 py-2 text-end font-mono font-bold text-app-label-primary">{formatNumber(sale.total_amount)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {saleReturns.length > 0 && (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="border-b border-app-separator px-4 py-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
              <Undo2 className="w-4 h-4 text-app-accent" /> المرتجعات
            </h2>
            <span className="text-xs text-app-label-secondary">
              إجمالي المرتجع <span className="font-mono font-bold text-app-label-primary">{formatNumber(returnedAmount)}</span>
            </span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                <th className="px-4 py-2 text-start font-semibold">رقم المرتجع</th>
                <th className="px-3 py-2 text-start font-semibold">التاريخ</th>
                <th className="px-3 py-2 text-start font-semibold">طريقة الرد</th>
                <th className="px-3 py-2 text-end font-semibold">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {saleReturns.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/sales/returns/${r.id}`)}
                  className="cursor-pointer hover:bg-app-fill-f1"
                >
                  <td className="px-4 py-2.5 font-mono font-bold text-app-accent">{r.number}</td>
                  <td className="px-3 py-2.5 font-mono">{formatDate(r.return_date)}</td>
                  <td className="px-3 py-2.5 text-app-label-secondary">{REFUND_METHOD_LABEL[r.refund_method] ?? r.refund_method}</td>
                  <td className="px-3 py-2.5 text-end font-mono font-bold">{formatNumber(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SaleInvoiceDialog saleId={showInvoice ? sale.id : null} onClose={() => setShowInvoice(false)} />
      <DeliveryNoteDialog saleId={showDeliveryNote ? sale.id : null} onClose={() => setShowDeliveryNote(false)} />
    </div>
  );
};
