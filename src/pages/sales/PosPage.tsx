import React, { useMemo, useState } from "react";
import {
  Store,
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Search,
  ShoppingCart,
  Package,
} from "lucide-react";
import { usePosCheckout, usePosDailyReport } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { SalesOrder } from "../../api/endpoints/sales";
import { InventoryItem } from "../../api/endpoints/inventory";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";
import { PosReceiptModal } from "../../components/pos/PosReceiptModal";
import { PosDailyCloseModal } from "../../components/pos/PosDailyCloseModal";
import { BlockPicker, PickedBlock } from "../../components/pos/BlockPicker";
import { formatNumber } from "../../lib/utils/format";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface CartLine {
  key: string;
  item: string;
  name: string;
  sku?: string;
  qty: string;
  price: string;
  stockLotId?: string | null;
  stockLotLabel?: string | null;
}

export const PosPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SalesOrder | null>(null);
  const [lastCashReceived, setLastCashReceived] = useState<number | undefined>(undefined);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
    editingKey: string | null;
  }>({ isOpen: false, item: null, editingKey: null });

  const { data: items, isLoading: isItemsLoading } = useInventoryItems({
    search: search || undefined,
  });
  const { data: report, isLoading: isReportLoading } = usePosDailyReport();
  const checkout = usePosCheckout();

  const total = useMemo(
    () => cart.reduce((s, l) => s + num(l.qty) * num(l.price), 0),
    [cart]
  );
  const change = num(cashReceived) - total;

  const addToCart = (item: InventoryItem) => {
    if (item.item_type === "foam_block") {
      setPickerState({ isOpen: true, item, editingKey: null });
      return;
    }

    const existing = cart.find((l) => l.item === item.id);
    if (existing) {
      setCart(
        cart.map((l) =>
          l.item === item.id ? { ...l, qty: String(num(l.qty) + 1) } : l
        )
      );
    } else {
      setCart([
        ...cart,
        {
          key: Math.random().toString(36).slice(2),
          item: item.id,
          name: item.name,
          sku: item.sku,
          qty: "1",
          price: "",
        },
      ]);
    }
  };

  const handlePickedBlock = (block: PickedBlock) => {
    const { item, editingKey } = pickerState;
    if (!item) return;

    if (editingKey) {
      // Re-pick on an existing line: clear the lot (empty id means "remove").
      if (!block.id) {
        setCart(
          cart.map((l) =>
            l.key === editingKey
              ? { ...l, stockLotId: null, stockLotLabel: null }
              : l
          )
        );
        return;
      }
      setCart(
        cart.map((l) =>
          l.key === editingKey
            ? {
                ...l,
                stockLotId: block.id,
                stockLotLabel: block.lot_number,
                price: l.price || String(block.unit_cost),
                qty: "1",
              }
            : l
        )
      );
      return;
    }

    setCart([
      ...cart,
      {
        key: Math.random().toString(36).slice(2),
        item: item.id,
        name: item.name,
        sku: item.sku,
        qty: "1",
        price: String(block.unit_cost),
        stockLotId: block.id,
        stockLotLabel: block.lot_number,
      },
    ]);
  };

  const reopenPickerFor = (line: CartLine) => {
    if (!line.stockLotId) return;
    const item = items?.data?.find((i) => i.id === line.item);
    if (!item) return;
    setPickerState({ isOpen: true, item, editingKey: line.key });
  };

  const submit = () => {
    setError(null);
    const paidAmount = num(cashReceived);
    checkout.mutate(
      {
        order_number: "POS-" + Date.now(),
        payment_method: method,
        items: cart.map((l) => ({
          inventory_item_id: l.item,
          stock_lot_id: l.stockLotId ?? null,
          quantity: num(l.qty),
          unit_price: num(l.price),
        })),
      },
      {
        onSuccess: (res) => {
          setReceipt(res.data);
          setLastCashReceived(method === "cash" && paidAmount > 0 ? paidAmount : undefined);
          setCart([]);
          setCashReceived("");
          toast.success(`تمت عملية البيع ${res.data.order_number} بنجاح`);
        },
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر إتمام عملية البيع."),
      }
    );
  };

  const canCheckout =
    cart.length > 0 &&
    cart.every((l) => num(l.qty) > 0 && num(l.price) > 0) &&
    (method === "card" || num(cashReceived) >= total);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Store className="w-7 h-7 text-app-accent" />
            نقطة البيع — المبيعات المباشرة (POS)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            خطوة واحدة: خروج فوري للبضاعة، استلام النقد، وتسليم الإيصال للعميل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {report && (
            <div className="flex items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs shadow-sm">
              <span className="text-app-label-secondary">اليوم:</span>
              <span className="font-mono font-bold text-app-label-primary">
                {report.sales_count} عملية · {formatNumber(report.total)} د.ل
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsDailyCloseOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-app-separator bg-app-bg-secondary px-3.5 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-app-accent" />
            تقرير الصندوق (Z-Report)
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Catalog Picker (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm flex flex-col overflow-hidden">
          <div className="border-b border-app-separator p-3 bg-app-bg-secondary">
            <div className="relative">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-app-label-secondary" />
              <input
                type="text"
                placeholder="البحث في المنتجات والأصناف (بالاسم أو رمز SKU)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-9 pe-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs text-app-label-primary focus:border-app-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-app-separator max-h-[500px] overflow-y-auto">
            {isItemsLoading ? (
              <div className="p-8 text-center text-xs text-app-label-secondary">
                جاري تحميل قائمة الأصناف...
              </div>
            ) : items?.data && items.data.length > 0 ? (
              items.data.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => addToCart(i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-app-fill-f1 transition-colors"
                >
                  <div className="flex flex-col pe-2">
                    <span className="text-xs font-semibold text-app-label-primary">
                      {i.name}
                    </span>
                    <span className="text-[10px] font-mono text-app-label-secondary mt-0.5">
                      {i.sku}
                      {i.item_type === "foam_block" && (
                        <span className="ms-2 text-app-accent">· قطعة إسفنج</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-bold text-app-accent">
                    <Plus className="w-3.5 w-3.5" />
                    <span>إضافة</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-xs text-app-label-secondary">
                لا توجد أصناف مطابقة للبحث.
              </div>
            )}
          </div>
        </div>

        {/* Cart & Checkout Terminal (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-app-separator px-5 py-3.5 bg-app-bg-secondary">
            <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
              <ShoppingCart className="h-4 w-4 text-app-accent" />
              <span>سلة المبيعات ({cart.length} أصناف)</span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[11px] text-app-status-danger hover:underline font-semibold"
              >
                تفريغ السلة
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 divide-y divide-app-separator max-h-[340px] overflow-y-auto p-2">
            {cart.map((l) => (
              <div key={l.key} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-app-fill-f1/50 rounded-xl transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-app-label-primary truncate">
                    {l.name}
                  </div>
                  {l.sku && (
                    <div className="text-[10px] font-mono text-app-label-secondary">
                      {l.sku}
                    </div>
                  )}
                  {l.stockLotId && (
                    <button
                      type="button"
                      onClick={() => reopenPickerFor(l)}
                      className="mt-1 inline-flex items-center gap-1 rounded-md bg-app-accent/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-app-accent hover:bg-app-accent/20"
                      title="تغيير القطعة"
                    >
                      <Package className="h-3 w-3" />
                      لوت {l.stockLotLabel}
                    </button>
                  )}
                </div>

                {/* Qty Input — locked to 1 when a block is picked */}
                <div className="w-20">
                  <label className="block text-[9px] text-app-label-secondary mb-0.5">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={l.qty}
                    readOnly={Boolean(l.stockLotId)}
                    onChange={(e) =>
                      setCart(
                        cart.map((x) =>
                          x.key === l.key ? { ...x, qty: e.target.value } : x
                        )
                      )
                    }
                    className={`w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none ${
                      l.stockLotId ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Price Input */}
                <div className="w-24">
                  <label className="block text-[9px] text-app-label-secondary mb-0.5">السعر الفردي</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="السعر"
                    value={l.price}
                    onChange={(e) =>
                      setCart(
                        cart.map((x) =>
                          x.key === l.key ? { ...x, price: e.target.value } : x
                        )
                      )
                    }
                    className="w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                  />
                </div>

                {/* Line Total */}
                <div className="w-24 text-end">
                  <label className="block text-[9px] text-app-label-secondary mb-0.5">الإجمالي</label>
                  <span className="text-xs font-mono font-bold text-app-label-primary">
                    {formatNumber(num(l.qty) * num(l.price))} <span className="text-[10px] font-sans">د.ل</span>
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setCart(cart.filter((x) => x.key !== l.key))}
                  className="mt-3 p-1.5 rounded-lg text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10 transition-colors"
                  title="حذف الصنف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-14 text-center text-xs text-app-label-secondary space-y-1">
                <Receipt className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
                <p className="font-semibold text-app-label-primary">السلة فارغة</p>
                <p className="text-[11px]">اختر الأصناف من القائمة الجانبية لإضافتها إلى السلة.</p>
              </div>
            )}
          </div>

          {/* Cart Bottom Checkout Terminal */}
          <div className="border-t border-app-separator p-5 bg-app-bg-secondary space-y-4">
            <div className="flex items-center justify-between border-b border-app-separator pb-3">
              <span className="text-sm font-bold text-app-label-primary">المجموع الكلي المطلوب:</span>
              <span className="text-2xl font-bold font-mono text-app-accent">
                {formatNumber(total)} <span className="text-sm font-sans">د.ل</span>
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  method === "cash"
                    ? "border-app-accent bg-app-accent text-white shadow-sm"
                    : "border-app-separator bg-app-bg-primary text-app-label-secondary hover:bg-app-fill-f1"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>دفع نقدي (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  method === "card"
                    ? "border-app-accent bg-app-accent text-white shadow-sm"
                    : "border-app-separator bg-app-bg-primary text-app-label-secondary hover:bg-app-fill-f1"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>بطاقة مصرفية (Card)</span>
              </button>
            </div>

            {/* Cash Tendered Calculation */}
            {method === "cash" && total > 0 && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-app-separator bg-app-bg-primary p-3">
                <div>
                  <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                    المبلغ المستلم من العميل (LYD)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="مثال: 500"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full px-3 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono font-bold focus:border-app-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                    المتبقي للعميل (الفكة)
                  </label>
                  <div
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center ${
                      change >= 0
                        ? "text-app-status-positive bg-app-status-positive/10 border border-app-status-positive/20"
                        : "text-app-status-danger bg-app-status-danger/10 border border-app-status-danger/20"
                    }`}
                  >
                    {change >= 0
                      ? `${formatNumber(change)} د.ل`
                      : `متبقي ${formatNumber(Math.abs(change))} د.ل`}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Checkout Button */}
            <button
              type="button"
              onClick={submit}
              disabled={!canCheckout || checkout.isPending}
              className="w-full rounded-xl bg-app-accent px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {checkout.isPending
                ? "جاري معالجة البيع وخصم المخزون..."
                : `إتمام البيع وطباعة الإيصال — ${formatNumber(total)} د.ل`}
            </button>
          </div>
        </div>
      </div>

      {/* POS Thermal Receipt Modal */}
      <PosReceiptModal
        isOpen={Boolean(receipt)}
        order={receipt}
        cashReceived={lastCashReceived}
        onClose={() => setReceipt(null)}
      />

      {/* POS Daily Register Closing / Z-Report Modal */}
      <PosDailyCloseModal
        isOpen={isDailyCloseOpen}
        report={report ?? null}
        isLoading={isReportLoading}
        onClose={() => setIsDailyCloseOpen(false)}
      />

      {/* Foam-block picker (POS path) */}
      {pickerState.item && (
        <BlockPicker
          isOpen={pickerState.isOpen}
          onClose={() => setPickerState({ isOpen: false, item: null, editingKey: null })}
          onPick={handlePickedBlock}
          inventoryItemId={pickerState.item.id}
          inventoryItemName={pickerState.item.name}
          initiallySelectedLotId={
            pickerState.editingKey
              ? cart.find((l) => l.key === pickerState.editingKey)?.stockLotId ?? null
              : null
          }
        />
      )}
    </div>
  );
};
