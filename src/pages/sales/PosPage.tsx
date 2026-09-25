import React, { useMemo, useState } from "react";
import {
  Store,
  Plus,
  Trash2,
  Wallet,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Search,
  ShoppingCart,
  Package,
  UserRound,
  X,
} from "lucide-react";
import { usePosCheckout, usePosDailyReport } from "../../hooks/useSales";
import { useInventoryItems } from "../../hooks/useInventory";
import { useClients } from "../../hooks/useClients";
import { SalesOrder } from "../../api/endpoints/sales";
import { InventoryItem } from "../../api/endpoints/inventory";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Client } from "../../types/entities";
import { toast } from "../../stores/toastStore";
import { PosReceiptModal } from "../../components/pos/PosReceiptModal";
import { PosDailyCloseModal } from "../../components/pos/PosDailyCloseModal";
import { BlockPicker, PickedBlock } from "../../components/pos/BlockPicker";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from "../../components/ui/Dialog";
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

interface ProductPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onPick: (item: InventoryItem) => void;
}

const ProductPickerDialog: React.FC<ProductPickerDialogProps> = ({ open, onClose, onPick }) => {
  const [search, setSearch] = useState("");
  const { data: items, isLoading } = useInventoryItems({ search: search || undefined });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>إضافة منتج إلى السلة</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-app-label-secondary" />
            <input
              type="text"
              autoFocus
              placeholder="البحث في المنتجات والأصناف (بالاسم أو رمز SKU)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="divide-y divide-app-separator max-h-[420px] overflow-y-auto rounded-xl border border-app-separator">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-app-label-secondary">
                جاري تحميل قائمة الأصناف...
              </div>
            ) : items?.data && items.data.length > 0 ? (
              items.data.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => onPick(i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-app-fill-f1 transition-colors"
                >
                  <div className="flex flex-col pe-2">
                    <span className="text-xs font-semibold text-app-label-primary">{i.name}</span>
                    <span className="text-[10px] font-mono text-app-label-secondary mt-0.5">
                      {i.sku}
                      {i.item_type === "foam_block" && (
                        <span className="ms-2 text-app-accent">· قطعة إسفنج</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-bold text-app-accent">
                    <Plus className="w-3.5 h-3.5" />
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export const PosPage: React.FC = () => {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  // Placeholder only for now — the backend checkout endpoint still accepts
  // just "cash" | "card", so this selection doesn't affect submission yet.
  const [method, setMethod] = useState<"bank" | "cash" | "receivables">("cash");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SalesOrder | null>(null);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    item: { id: string; name: string; sku?: string } | null;
    editingKey: string | null;
  }>({ isOpen: false, item: null, editingKey: null });

  const { data: clients } = useClients();
  const { data: report, isLoading: isReportLoading } = usePosDailyReport();
  const checkout = usePosCheckout();

  const total = useMemo(
    () => cart.reduce((s, l) => s + num(l.qty) * num(l.price), 0),
    [cart]
  );

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
    setPickerState({
      isOpen: true,
      item: { id: line.item, name: line.name, sku: line.sku },
      editingKey: line.key,
    });
  };

  const submit = () => {
    setError(null);
    checkout.mutate(
      {
        order_number: "POS-" + Date.now(),
        // The three-way method selector above is a placeholder for now —
        // the backend only accepts "cash" | "card", so every sale submits
        // as "cash" until bank/receivables settlement is supported.
        payment_method: "cash",
        client_id: client?.id,
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
          setCart([]);
          setClient(null);
          toast.success(`تمت عملية البيع ${res.data.order_number} بنجاح`);
        },
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر إتمام عملية البيع."),
      }
    );
  };

  const canCheckout =
    cart.length > 0 && cart.every((l) => num(l.qty) > 0 && num(l.price) > 0);

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
            اختر عميلًا (اختياري)، أضف المنتجات إلى السلة، ثم أتمم عملية البيع.
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

      {/* Client Selector */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-app-label-primary shrink-0">
            <UserRound className="h-4 w-4 text-app-accent" />
            العميل
          </div>

          <div className="flex-1">
            <SearchableSelect<Client>
              options={clients ?? []}
              value={client}
              onChange={setClient}
              getOptionId={(c) => c.id}
              getOptionLabel={(c) => c.entity?.name ?? c.id}
              getOptionSubLabel={(c) => c.entity?.primary_contact?.phone ?? undefined}
              placeholder="بيع نقدي بدون عميل مسجل — اختر عميلًا (اختياري)…"
              clearable
              size="sm"
            />
          </div>

          {client && (
            <div className="flex items-center gap-2 rounded-xl bg-app-accent-subtle px-3 py-1.5 text-xs font-bold text-app-accent">
              <span>{client.entity?.name}</span>
              <button
                type="button"
                onClick={() => setClient(null)}
                className="text-app-accent/70 hover:text-app-accent"
                title="إزالة العميل"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
              <Wallet className="h-4 w-4 text-app-accent" />
              طريقة الدفع
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "bank" | "cash" | "receivables")}
              title="عرض مبدئي فقط ولا يؤثر على عملية البيع حاليًا"
              className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary focus:border-app-accent focus:outline-none"
            >
              <option value="bank">مصرف</option>
              <option value="cash">نقدي</option>
              <option value="receivables">ذمم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cart Table */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-app-separator px-5 py-3.5 bg-app-bg-secondary">
          <div className="flex items-center gap-2 text-sm font-bold text-app-label-primary">
            <ShoppingCart className="h-4 w-4 text-app-accent" />
            <span>سلة المبيعات ({cart.length} أصناف)</span>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[11px] text-app-status-danger hover:underline font-semibold"
              >
                تفريغ السلة
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              إضافة منتج
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-16 text-center text-xs text-app-label-secondary space-y-1">
            <Receipt className="w-8 h-8 text-app-label-secondary/40 mx-auto mb-2" />
            <p className="font-semibold text-app-label-primary">السلة فارغة</p>
            <p className="text-[11px]">اضغط "إضافة منتج" لاختيار الأصناف وإضافتها إلى السلة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-app-separator bg-app-bg-secondary/60 text-app-label-secondary">
                  <th className="px-4 py-2.5 text-start font-semibold">الصنف</th>
                  <th className="px-3 py-2.5 text-center font-semibold w-24">الكمية</th>
                  <th className="px-3 py-2.5 text-center font-semibold w-28">السعر الفردي</th>
                  <th className="px-4 py-2.5 text-end font-semibold w-28">الإجمالي</th>
                  <th className="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-separator">
                {cart.map((l) => (
                  <tr key={l.key} className="hover:bg-app-fill-f1/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-app-label-primary">{l.name}</div>
                      {l.sku && (
                        <div className="text-[10px] font-mono text-app-label-secondary">{l.sku}</div>
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
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={l.qty}
                        readOnly={Boolean(l.stockLotId)}
                        onChange={(e) =>
                          setCart(
                            cart.map((x) => (x.key === l.key ? { ...x, qty: e.target.value } : x))
                          )
                        }
                        className={`w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none ${
                          l.stockLotId ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="السعر"
                        value={l.price}
                        onChange={(e) =>
                          setCart(
                            cart.map((x) => (x.key === l.key ? { ...x, price: e.target.value } : x))
                          )
                        }
                        className="w-full px-2 py-1 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-end font-mono font-bold text-app-label-primary">
                      {formatNumber(num(l.qty) * num(l.price))}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setCart(cart.filter((x) => x.key !== l.key))}
                        className="p-1.5 rounded-lg text-app-label-secondary hover:text-app-status-danger hover:bg-app-status-danger/10 transition-colors"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Terminal */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-secondary shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-app-separator pb-3">
          <span className="text-sm font-bold text-app-label-primary">المجموع الكلي المطلوب:</span>
          <span className="text-2xl font-bold font-mono text-app-accent">
            {formatNumber(total)} <span className="text-sm font-sans">د.ل</span>
          </span>
        </div>

        {/* Submit Checkout Button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canCheckout || checkout.isPending}
          className="w-full max-w-md rounded-xl bg-app-accent px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {checkout.isPending
            ? "جاري معالجة البيع وخصم المخزون..."
            : `إتمام البيع وطباعة الإيصال — ${formatNumber(total)} د.ل`}
        </button>
      </div>

      {/* Product Picker Dialog */}
      <ProductPickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={addToCart}
      />

      {/* POS Thermal Receipt Modal */}
      <PosReceiptModal
        isOpen={Boolean(receipt)}
        order={receipt}
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
