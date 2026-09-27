import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  Building2,
  FileText,
  Landmark,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  UserPlus,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useCheckout, useConvertQuotation, useCreateQuotation, usePaymentAccounts } from "../../hooks/useSales";
import { useClients } from "../../hooks/useClients";
import { useOperatingUnits } from "../../hooks/useOperatingUnits";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import {
  CartLineInput,
  PAYMENT_METHOD_LABEL,
  PaymentMethod,
  Quotation,
  Sale,
  formatSizeCm,
} from "../../api/endpoints/sales";
import { InventoryItem, suggestedPrice } from "../../api/endpoints/inventory";
import { Bundle } from "../../api/endpoints/bundles";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { Client, OperatingUnit } from "../../types/entities";
import { toast } from "../../stores/toastStore";
import { SearchableSelect } from "../ui/SearchableSelect";
import { QuickClientDialog } from "../clients/QuickClientDialog";
import { ProductPickerDialog } from "./ProductPickerDialog";
import { BundlePickerDialog } from "../sales/BundlePickerDialog";
import { BlockPicker, PickedBlock } from "./BlockPicker";
import { SaleCompletedDialog } from "./SaleCompletedDialog";
import { QuotationPrintDialog } from "../print/SalesDocuments";
import { formatNumber } from "../../lib/utils/format";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const newRequestId = () => crypto.randomUUID();

interface CartLine {
  key: string;
  lineType: "item" | "bundle";
  itemId?: string;
  bundleId?: string;
  name: string;
  code?: string;
  qty: string;
  /** Unit price — editable; starts from the item's own price or the bundle's template. */
  price: string;
  stockLotId?: string | null;
  stockLotLabel?: string | null;
  size?: { length_m: number; width_m: number; height_m: number } | null;
}

type BuyerMode = "client" | "internal";

interface NewSalePanelProps {
  /** A quotation the client came back with — its lines load into the cart. */
  loadedQuotation: Quotation | null;
  onQuotationDone: () => void;
}

export const NewSalePanel: React.FC<NewSalePanelProps> = ({ loadedQuotation, onQuotationDone }) => {
  const navigate = useNavigate();
  const currentUnitId = useServerConfigStore((s) => s.operatingUnitId);

  const [buyerMode, setBuyerMode] = useState<BuyerMode>("client");
  const [clientId, setClientId] = useState<string | null>(null);
  const [buyerUnitId, setBuyerUnitId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashAccountId, setCashAccountId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [requestId, setRequestId] = useState(newRequestId);
  const [error, setError] = useState<string | null>(null);

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isBundlePickerOpen, setIsBundlePickerOpen] = useState(false);
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [blockPicker, setBlockPicker] = useState<{ item: InventoryItem; editingKey: string | null } | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [printQuotationId, setPrintQuotationId] = useState<string | null>(null);

  const { data: clients = [] } = useClients();
  const { data: units = [] } = useOperatingUnits();
  const { data: paymentAccounts = [] } = usePaymentAccounts();
  const checkout = useCheckout();
  const convert = useConvertQuotation();
  const createQuotation = useCreateQuotation();

  const client = clients.find((c) => c.id === clientId) ?? null;
  const otherUnits = units.filter((u) => u.id !== currentUnitId);
  const isInternal = buyerMode === "internal";
  const treasuries = paymentAccounts.filter((a) => a.kind === method);
  const linkedTreasuries = treasuries.filter((a) => a.account_id);

  // A quotation the client came back with fills the cart.
  useEffect(() => {
    if (!loadedQuotation) return;
    setBuyerMode("client");
    setClientId(loadedQuotation.client_id);
    setCart(
      (loadedQuotation.lines ?? []).map((l) => ({
        key: crypto.randomUUID(),
        lineType: l.line_type,
        itemId: l.inventory_item_id ?? undefined,
        bundleId: l.bundle_id ?? undefined,
        name: l.description ?? l.bundle?.name ?? l.inventory_item?.name ?? "",
        code: l.inventory_item?.code,
        qty: String(Number(l.quantity)),
        price: String(Number(l.unit_price)),
        size: l.length_m && l.width_m && l.height_m
          ? { length_m: Number(l.length_m), width_m: Number(l.width_m), height_m: Number(l.height_m) }
          : null,
      })),
    );
    setRequestId(newRequestId());
    setError(null);
  }, [loadedQuotation]);

  // One linked treasury of the chosen kind is picked for the cashier.
  useEffect(() => {
    if (method === "receivable") {
      setCashAccountId(null);
    } else if (!linkedTreasuries.some((a) => a.id === cashAccountId)) {
      setCashAccountId(linkedTreasuries.length === 1 ? linkedTreasuries[0].id : null);
    }
  }, [method, linkedTreasuries, cashAccountId]);

  const total = useMemo(() => cart.reduce((s, l) => s + num(l.qty) * num(l.price), 0), [cart]);
  const creditLimit = Number(client?.credit_limit ?? 0);
  const balance = Number(client?.current_balance ?? 0);
  const available = creditLimit - balance;
  const needsApproval = method === "receivable" && client !== null && total > available;
  const hasBundle = cart.some((l) => l.lineType === "bundle");

  const resetCart = () => {
    setCart([]);
    setRequestId(newRequestId());
    setError(null);
    if (loadedQuotation) onQuotationDone();
  };

  const updateLine = (key: string, patch: Partial<CartLine>) =>
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addItem = (item: InventoryItem) => {
    setIsProductPickerOpen(false);
    if (item.item_type === "foam_block") {
      setBlockPicker({ item, editingKey: null });
      return;
    }
    const existing = cart.find((l) => l.lineType === "item" && l.itemId === item.id && !l.stockLotId);
    if (existing) {
      updateLine(existing.key, { qty: String(num(existing.qty) + 1) });
      return;
    }
    const unitPrice = suggestedPrice(item, 1);
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "item",
        itemId: item.id,
        name: item.name,
        code: item.code,
        qty: "1",
        price: unitPrice !== null ? String(unitPrice) : "",
      },
    ]);
  };

  const addBundle = (bundle: Bundle, suggestedTotal: number | null) => {
    if (isInternal) return;
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "bundle",
        bundleId: bundle.id,
        name: bundle.name,
        qty: "1",
        price: suggestedTotal !== null ? String(suggestedTotal) : "",
      },
    ]);
  };

  const pickBlock = (block: PickedBlock) => {
    if (!blockPicker) return;
    const { item, editingKey } = blockPicker;
    const size = block.id ? { length_m: block.length_m, width_m: block.width_m, height_m: block.height_m } : null;
    const unitPrice = size ? suggestedPrice(item, 1, size) : null;

    if (editingKey) {
      updateLine(editingKey, {
        stockLotId: block.id || null,
        stockLotLabel: block.lot_number || null,
        size,
        qty: "1",
        ...(unitPrice !== null ? { price: String(unitPrice) } : {}),
      });
      return;
    }
    if (!block.id) return;
    setCart((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        lineType: "item",
        itemId: item.id,
        name: item.name,
        code: item.code,
        qty: "1",
        price: unitPrice !== null ? String(unitPrice) : "",
        stockLotId: block.id,
        stockLotLabel: block.lot_number,
        size,
      },
    ]);
  };

  const cartLines = (): CartLineInput[] =>
    cart.map((l) => ({
      line_type: l.lineType,
      inventory_item_id: l.itemId ?? null,
      bundle_id: l.bundleId ?? null,
      stock_lot_id: l.stockLotId ?? null,
      quantity: num(l.qty),
      unit_price: num(l.price),
      length_m: l.size?.length_m ?? null,
      width_m: l.size?.width_m ?? null,
      height_m: l.size?.height_m ?? null,
    }));

  const onSold = (sale: Sale) => {
    resetCart();
    if (!isInternal) setClientId(null);

    if (sale.status === "pending_approval") {
      toast.warning(`البيع ${sale.order_number} تجاوز سقف ائتمان العميل وينتظر موافقة المدير.`);
      return;
    }

    toast.success(`تم البيع ${sale.order_number}`);
    const bundleLine = sale.lines?.find((l) => l.line_type === "bundle");
    if (bundleLine) {
      navigate(`/sales/${sale.id}/bundles/${bundleLine.id}`);
      return;
    }
    setCompletedSale(sale);
  };

  const fail = (err: unknown) => {
    const payload = apiErrorPayload(err);
    const fieldError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    setError(fieldError ?? payload?.message ?? "تعذّر إتمام العملية.");
  };

  const submit = () => {
    setError(null);
    const lines = cartLines();

    if (loadedQuotation) {
      convert.mutate(
        { id: loadedQuotation.id, client_request_id: requestId, payment_method: method, cash_account_id: cashAccountId, lines },
        { onSuccess: onSold, onError: fail },
      );
      return;
    }

    checkout.mutate(
      {
        client_request_id: requestId,
        client_id: isInternal ? null : clientId,
        buyer_unit_id: isInternal ? buyerUnitId : null,
        payment_method: isInternal ? null : method,
        cash_account_id: isInternal ? null : cashAccountId,
        lines,
      },
      { onSuccess: onSold, onError: fail },
    );
  };

  const saveQuotation = () => {
    if (!clientId) return;
    setError(null);
    createQuotation.mutate(
      { client_id: clientId, lines: cartLines() },
      {
        onSuccess: (quotation) => {
          toast.success(`تم حفظ عرض السعر ${quotation.quotation_number}`);
          resetCart();
          setPrintQuotationId(quotation.id);
        },
        onError: fail,
      },
    );
  };

  const linesValid =
    cart.length > 0 &&
    cart.every((l) => num(l.qty) > 0 && l.price.trim() !== "" && num(l.price) >= 0 && (l.lineType === "item" || num(l.price) > 0));
  const buyerValid = isInternal ? Boolean(buyerUnitId) : Boolean(clientId);
  const paymentValid = isInternal || method === "receivable" || Boolean(cashAccountId);
  const canCheckout = linesValid && buyerValid && paymentValid && (isInternal || total > 0);
  const isBusy = checkout.isPending || convert.isPending;

  return (
    <div className="space-y-5">
      {loadedQuotation && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-app-accent/40 bg-app-accent/10 p-3 text-xs">
          <span className="flex items-center gap-2 font-semibold text-app-accent">
            <FileText className="h-4 w-4" />
            تحويل عرض السعر <span className="font-mono">{loadedQuotation.quotation_number}</span> إلى بيع — يمكن تعديل الأسعار قبل الإتمام.
          </span>
          <button type="button" onClick={resetCart} className="text-app-label-secondary hover:text-app-status-danger">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Buyer */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
            <UserRound className="h-4 w-4 text-app-accent" />
            المشتري
          </h3>
          {!loadedQuotation && (
            <div className="inline-flex rounded-xl border border-app-separator p-0.5 bg-app-bg-secondary">
              {([
                { value: "client", label: "عميل", icon: UserRound },
                { value: "internal", label: "وحدة داخلية", icon: Building2 },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setBuyerMode(opt.value);
                    if (opt.value === "internal") setCart((prev) => prev.filter((l) => l.lineType === "item"));
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold ${
                    buyerMode === opt.value ? "bg-app-bg-primary text-app-accent shadow-sm" : "text-app-label-secondary"
                  }`}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isInternal ? (
          <div className="space-y-1">
            <SearchableSelect<OperatingUnit>
              options={otherUnits}
              value={otherUnits.find((u) => u.id === buyerUnitId) ?? null}
              onChange={(u) => setBuyerUnitId(u ? u.id : null)}
              getOptionId={(u) => u.id}
              getOptionLabel={(u) => u.name}
              placeholder="اختر الوحدة المستلمة…"
              size="sm"
            />
            <p className="text-[11px] text-app-label-tertiary">
              التحويل الداخلي ينقل الأصناف بسعر التكلفة — بدون دفع ولا إيراد. الحزم لا تُحوَّل داخلياً.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect<Client>
                  options={clients}
                  value={client}
                  onChange={(c) => setClientId(c ? c.id : null)}
                  getOptionId={(c) => c.id}
                  getOptionLabel={(c) => c.entity?.name ?? c.id}
                  getOptionSubLabel={(c) => c.entity?.primary_contact?.phone ?? undefined}
                  getOptionSearchText={(c) => `${c.entity?.name ?? ""} ${c.entity?.primary_contact?.phone ?? ""}`}
                  placeholder="ابحث عن العميل بالاسم أو الهاتف…"
                  disabled={Boolean(loadedQuotation)}
                  size="sm"
                />
              </div>
              {!loadedQuotation && (
                <button
                  type="button"
                  onClick={() => setIsQuickClientOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 text-xs font-bold text-app-accent hover:bg-app-accent/15"
                >
                  <UserPlus className="h-4 w-4" />
                  عميل جديد
                </button>
              )}
            </div>
            {client && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-app-label-secondary font-mono">
                <span>سقف الائتمان {formatNumber(creditLimit)}</span>
                <span>الرصيد المستحق {formatNumber(balance)}</span>
                <span className={available > 0 ? "text-app-status-positive" : "text-app-status-danger"}>
                  المتاح {formatNumber(available)}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Payment */}
      {!isInternal && (
        <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
            <Wallet className="h-4 w-4 text-app-accent" />
            طريقة الدفع
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "cash", icon: Wallet },
              { value: "bank", icon: Landmark },
              { value: "receivable", icon: FileText },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMethod(opt.value)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${
                  method === opt.value
                    ? "border-app-accent bg-app-accent text-white"
                    : "border-app-separator bg-app-bg-secondary text-app-label-secondary"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {PAYMENT_METHOD_LABEL[opt.value]}
              </button>
            ))}
          </div>

          {method !== "receivable" ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-app-label-secondary">
                {method === "cash" ? "الخزينة المستلمة" : "الحساب المصرفي المستلم"}
              </label>
              <select
                value={cashAccountId ?? ""}
                onChange={(e) => setCashAccountId(e.target.value || null)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              >
                <option value="">اختر…</option>
                {treasuries.map((a) => (
                  <option key={a.id} value={a.id} disabled={!a.account_id}>
                    {a.name}
                    {a.account ? ` — ${a.account.account_code}` : " (غير مربوطة بحساب محاسبي)"}
                  </option>
                ))}
              </select>
              {treasuries.length === 0 && (
                <p className="text-[11px] text-app-status-warning">
                  لا توجد {method === "cash" ? "خزينة" : "حسابات مصرفية"} لهذه الوحدة — أضفها من صفحة الخزينة.
                </p>
              )}
            </div>
          ) : (
            <p className={`text-[11px] ${needsApproval ? "text-app-status-warning font-semibold" : "text-app-label-tertiary"}`}>
              {needsApproval
                ? `هذا البيع يتجاوز المتاح من سقف العميل بمقدار ${formatNumber(total - available)} — سيُرسل لموافقة المدير ولن يُصرف شيء قبلها.`
                : "يُقيَّد المبلغ على حساب ذمم العميل ويُحصَّل لاحقاً."}
            </p>
          )}
        </section>
      )}

      {/* Cart */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-app-separator px-5 py-3 bg-app-bg-secondary">
          <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <ShoppingCart className="h-4 w-4 text-app-accent" />
            السلة ({cart.length})
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button type="button" onClick={resetCart} className="text-[11px] text-app-status-danger hover:underline font-semibold">
                تفريغ
              </button>
            )}
            {!isInternal && (
              <button
                type="button"
                onClick={() => setIsBundlePickerOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/15"
              >
                <Boxes className="w-4 h-4" />
                حزمة
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              صنف
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-14 text-center text-xs text-app-label-secondary space-y-1">
            <Receipt className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
            <p className="font-semibold text-app-label-primary">السلة فارغة</p>
            <p className="text-[11px]">أضف أصنافاً من المخزون أو حزمة كاملة مثل «جلسة عربية».</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                <th className="px-4 py-2.5 text-start font-semibold">البيان</th>
                <th className="px-3 py-2.5 text-center font-semibold w-24">الكمية</th>
                <th className="px-3 py-2.5 text-center font-semibold w-32">{isInternal ? "بالتكلفة" : "سعر الوحدة"}</th>
                <th className="px-4 py-2.5 text-end font-semibold w-28">الإجمالي</th>
                <th className="px-3 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator">
              {cart.map((l) => {
                const size = l.size ? formatSizeCm(l.size.length_m, l.size.width_m, l.size.height_m) : null;
                return (
                  <tr key={l.key} className="hover:bg-app-fill-f1/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 font-semibold text-app-label-primary">
                        {l.lineType === "bundle" && <Boxes className="h-3.5 w-3.5 text-app-accent" />}
                        {l.name}
                      </div>
                      <div className="text-[10px] text-app-label-secondary font-mono">
                        {l.lineType === "bundle"
                          ? "حزمة — يُحدَّد محتواها بعد البيع"
                          : [l.code, size].filter(Boolean).join(" · ")}
                      </div>
                      {l.stockLotId && (
                        <button
                          type="button"
                          onClick={() =>
                            setBlockPicker({
                              item: { id: l.itemId as string, name: l.name, code: l.code ?? "" } as InventoryItem,
                              editingKey: l.key,
                            })
                          }
                          className="mt-1 inline-flex items-center gap-1 rounded-md bg-app-accent/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-app-accent hover:bg-app-accent/20"
                        >
                          <Package className="h-3 w-3" />
                          لوت {l.stockLotLabel}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={l.qty}
                        readOnly={Boolean(l.stockLotId)}
                        onChange={(e) => updateLine(l.key, { qty: e.target.value })}
                        className={`w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none ${
                          l.stockLotId ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      {isInternal ? (
                        <div className="text-center text-[11px] text-app-label-tertiary">تكلفة المخزون</div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="السعر"
                          value={l.price}
                          onChange={(e) => updateLine(l.key, { price: e.target.value })}
                          className="w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-end font-mono font-bold text-app-label-primary">
                      {isInternal ? "—" : formatNumber(num(l.qty) * num(l.price))}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((x) => x.key !== l.key))}
                        className="p-1.5 rounded-lg text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Checkout */}
      <section className="rounded-2xl border border-app-separator bg-app-bg-secondary shadow-sm p-5 space-y-4">
        {!isInternal && (
          <div className="flex items-center justify-between border-b border-app-separator pb-3">
            <span className="text-sm font-bold text-app-label-primary">المجموع المطلوب</span>
            <span className="text-2xl font-bold font-mono text-app-accent">
              {formatNumber(total)} <span className="text-sm font-sans">د.ل</span>
            </span>
          </div>
        )}
        {hasBundle && (
          <p className="text-[11px] text-app-label-secondary">
            بعد الإتمام تنتقل مباشرة لتحديد قطع الحزمة ومقاساتها، ثم تجهيزها من المخزون أو إرسالها للمقص.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!canCheckout || isBusy}
            className="flex-1 min-w-[16rem] rounded-xl bg-app-accent px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40"
          >
            {isBusy
              ? "جارٍ إتمام البيع…"
              : isInternal
                ? "إتمام التحويل الداخلي"
                : needsApproval
                  ? `إرسال للموافقة — ${formatNumber(total)} د.ل`
                  : `إتمام البيع — ${formatNumber(total)} د.ل`}
          </button>
          {!isInternal && !loadedQuotation && (
            <button
              type="button"
              onClick={saveQuotation}
              disabled={!linesValid || !clientId || createQuotation.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-primary px-4 py-3 text-xs font-bold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-40"
            >
              <FileText className="h-4 w-4 text-app-accent" />
              {createQuotation.isPending ? "جارٍ الحفظ…" : "حفظ كعرض سعر"}
            </button>
          )}
        </div>
      </section>

      <ProductPickerDialog open={isProductPickerOpen} onClose={() => setIsProductPickerOpen(false)} onPick={addItem} />
      <BundlePickerDialog open={isBundlePickerOpen} onClose={() => setIsBundlePickerOpen(false)} onPick={addBundle} />
      <QuickClientDialog
        open={isQuickClientOpen}
        onClose={() => setIsQuickClientOpen(false)}
        onCreated={(c) => setClientId(c.id)}
      />
      {blockPicker && (
        <BlockPicker
          isOpen
          onClose={() => setBlockPicker(null)}
          onPick={pickBlock}
          inventoryItemId={blockPicker.item.id}
          inventoryItemName={blockPicker.item.name}
          initiallySelectedLotId={
            blockPicker.editingKey ? cart.find((l) => l.key === blockPicker.editingKey)?.stockLotId ?? null : null
          }
        />
      )}
      <SaleCompletedDialog sale={completedSale} onClose={() => setCompletedSale(null)} />
      <QuotationPrintDialog quotationId={printQuotationId} onClose={() => setPrintQuotationId(null)} />
    </div>
  );
};
