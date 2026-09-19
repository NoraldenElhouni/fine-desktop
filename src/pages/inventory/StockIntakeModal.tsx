import React, { useMemo, useState } from "react";
import { AlertTriangle, PackagePlus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStockIntake } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import { getImportOrders } from "../../api/endpoints/procurement";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { InventoryItem } from "../../api/endpoints/inventory";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";
import { ImportOrder, getImportOrderTotal } from "../../types/procurement";
import { formatNumber } from "../../lib/utils/format";

type IntakeSource = "opening_balance" | "purchase_cash" | "purchase_credit" | "import_receipt";

const SOURCE_LABEL: Record<IntakeSource, string> = {
  opening_balance: "رصيد افتتاحي",
  purchase_cash: "شراء نقدي",
  purchase_credit: "شراء آجل (ذمم)",
  import_receipt: "استلام أمر استيراد",
};

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const generateSuggestedLot = (item?: InventoryItem | null, order?: ImportOrder | null): string => {
  const sku = item?.sku?.replace(/[^A-Za-z0-9_-]/g, "") || "ITEM";
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSeq = String(Math.floor(10 + Math.random() * 90));

  if (order) {
    const orderRef = order.id.slice(0, 6);
    return `IMP-${orderRef}-${sku}-${randomSeq}`;
  }

  return `LOT-${sku}-${dateStr}-${randomSeq}`;
};

export const StockIntakeModal: React.FC<{
  items: InventoryItem[];
  onClose: () => void;
}> = ({ items, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [source, setSource] = useState<IntakeSource>("purchase_credit");
  const [importOrderId, setImportOrderId] = useState("");

  const { data: warehouses } = useWarehouses();
  const { data: importOrders } = useQuery({
    queryKey: ["importOrders", "received-and-complete"],
    queryFn: async () => {
      const [received, complete] = await Promise.all([
        getImportOrders({ status: "received" }),
        getImportOrders({ status: "complete" }),
      ]);
      return [...received, ...complete];
    },
    enabled: source === "import_receipt",
  });
  const intakeMutation = useStockIntake();

  const selectedItem = useMemo(() => items.find((i) => i.id === itemId) ?? null, [items, itemId]);
  const selectedImportOrder = useMemo(
    () => (importOrders as ImportOrder[] | undefined)?.find((o) => o.id === importOrderId) ?? null,
    [importOrders, importOrderId],
  );

  const handleItemChange = (item: InventoryItem | null) => {
    const newId = item ? item.id : "";
    setItemId(newId);
    if (!lotNumber.trim() && item) {
      setLotNumber(generateSuggestedLot(item, selectedImportOrder));
    }
  };

  const handleImportOrderChange = (order: ImportOrder | null) => {
    const newOrderId = order ? order.id : "";
    setImportOrderId(newOrderId);

    if (order) {
      // Auto-prefill warehouse if available on the order
      const suggestedWh = order.goods_receipt?.warehouse_id ?? order.arrived_warehouse_id;
      if (suggestedWh && !warehouseId) {
        setWarehouseId(suggestedWh);
      }
      // Auto-prefill quantity if not set
      if (!quantity || num(quantity) === 0) {
        setQuantity(String(order.quantity));
      }
      // Auto-prefill unit cost if not set
      if (!unitCost || num(unitCost) === 0) {
        if (order.negotiated_price) {
          setUnitCost(String(order.negotiated_price));
        }
      }
      // Suggest lot number if empty
      if (!lotNumber.trim() || lotNumber.startsWith("LOT-")) {
        setLotNumber(generateSuggestedLot(selectedItem, order));
      }
    }
  };

  const triggerAutoLot = () => {
    setLotNumber(generateSuggestedLot(selectedItem, selectedImportOrder));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    intakeMutation.mutate(
      {
        inventory_item_id: itemId,
        warehouse_id: warehouseId,
        lot_number: lotNumber.trim() || undefined,
        quantity: num(quantity),
        unit_cost: num(unitCost),
        source,
        import_order_id: source === "import_receipt" ? importOrderId : undefined,
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذر استلام المخزون."),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-app-accent" />
              استلام مخزون (Stock Intake)
            </DialogTitle>
            <DialogDescription>
              الكمية تدخل كدفعة في المخزن مع حركة مخزون وقيد محاسبي حسب المصدر.
              استلام أوامر الاستيراد لا يُقيد مرتين — قيمته سُجلت عند إغلاق الأمر.
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="stock-intake-form" onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">الصنف</label>
              <SearchableSelect<InventoryItem>
                options={items}
                value={selectedItem}
                onChange={handleItemChange}
                getOptionId={(i) => i.id}
                getOptionLabel={(i) => i.name}
                getOptionSubLabel={(i) => i.sku}
                getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                placeholder="الصنف…"
                required
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">المخزن المستلم</label>
                <SearchableSelect<{ id: string; name: string }>
                  options={warehouses ?? []}
                  value={warehouses?.find((w) => w.id === warehouseId) ?? null}
                  onChange={(w) => setWarehouseId(w ? w.id : "")}
                  getOptionId={(w) => w.id}
                  getOptionLabel={(w) => w.name}
                  placeholder="المخزن…"
                  required
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-app-label-secondary">
                    رقم الدفعة (Lot Number)
                  </label>
                  <button
                    type="button"
                    onClick={triggerAutoLot}
                    className="flex items-center gap-1 text-[11px] font-bold text-app-accent hover:opacity-80 transition-opacity"
                    title="توليد رقم دفعة فريد تلقائياً"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>توليد تلقائي</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="رقم الدفعة (اتركه فارغاً للتوليد التلقائي)"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-app-label-tertiary">
              يمكنك إدخال رقم دفعة المورد، أو النقر على "توليد تلقائي" للحصول على رقم فريد، أو تركه فارغاً.
            </p>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الكمية</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  placeholder="الكمية"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">تكلفة الوحدة (LYD)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  placeholder="تكلفة الوحدة (LYD)"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="flex-1 w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">مصدر الإدخال</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as IntakeSource)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
              >
                {(Object.keys(SOURCE_LABEL) as IntakeSource[]).map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {source === "import_receipt" && (
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  أمر الشراء / الاستيراد المرتبط
                </label>
                <SearchableSelect<ImportOrder>
                  options={(importOrders as ImportOrder[]) ?? []}
                  value={selectedImportOrder}
                  onChange={handleImportOrderChange}
                  getOptionId={(o) => o.id}
                  getOptionLabel={(o) => `${o.supplier?.name ?? "مورد غير محدد"} (أمر #${o.id.slice(0, 6)})`}
                  getOptionSubLabel={(o) =>
                    `الكمية: ${formatNumber(o.quantity)} | الإجمالي: ${formatNumber(getImportOrderTotal(o))} ${o.currency ?? ""} | الحالة: ${o.status}`
                  }
                  getOptionSearchText={(o) =>
                    `${o.supplier?.name ?? ""} ${o.id.slice(0, 6)} ${o.currency ?? ""}`
                  }
                  placeholder="اختر أمر الاستيراد المستلم…"
                  required
                />
              </div>
            )}
          </form>
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="stock-intake-form"
            disabled={intakeMutation.isPending}
            className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {intakeMutation.isPending ? "جارٍ الاستلام…" : "استلام وقيد"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
