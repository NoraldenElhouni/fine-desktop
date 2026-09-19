import React, { useMemo, useState } from "react";
import { AlertTriangle, Calculator, Layers, PackagePlus, Settings2, Sparkles } from "lucide-react";
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
  const [containerQuantity, setContainerQuantity] = useState("");
  const [containerCapacity, setContainerCapacity] = useState("");
  const [containerUom, setContainerUom] = useState("");
  const [measureUom, setMeasureUom] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showUomCustomizer, setShowUomCustomizer] = useState(false);
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
    if (item) {
      const cUom = item.primary_uom || "";
      const mUom = item.secondary_uom || item.unit_of_measure || "";
      const cap = item.container_capacity ? String(item.container_capacity) : "";
      setContainerUom(cUom);
      setMeasureUom(mUom);
      setContainerCapacity(cap);
      setSaveAsDefault(false);

      const capVal = num(cap);
      if (capVal > 0) {
        if (containerQuantity && num(containerQuantity) > 0) {
          const total = Math.round(num(containerQuantity) * capVal * 10000) / 10000;
          setQuantity(String(total));
        } else if (quantity && num(quantity) > 0) {
          const cCount = Math.round((num(quantity) / capVal) * 10000) / 10000;
          setContainerQuantity(String(cCount));
        }
      }
    } else {
      setContainerUom("");
      setMeasureUom("");
      setContainerCapacity("");
      setSaveAsDefault(false);
    }
  };

  const handleContainerQuantityChange = (val: string) => {
    setContainerQuantity(val);
    const cq = num(val);
    const cap = num(containerCapacity);
    if (cq > 0 && cap > 0) {
      const total = Math.round(cq * cap * 10000) / 10000;
      setQuantity(String(total));
    }
  };

  const handleContainerCapacityChange = (val: string) => {
    setContainerCapacity(val);
    const cap = num(val);
    const cq = num(containerQuantity);
    const q = num(quantity);
    if (cap > 0) {
      if (cq > 0) {
        const total = Math.round(cq * cap * 10000) / 10000;
        setQuantity(String(total));
      } else if (q > 0) {
        const calculatedCq = Math.round((q / cap) * 10000) / 10000;
        setContainerQuantity(String(calculatedCq));
      }
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const q = num(val);
    const cap = num(containerCapacity);
    if (q > 0 && cap > 0) {
      const cq = Math.round((q / cap) * 10000) / 10000;
      setContainerQuantity(String(cq));
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
        const capVal = num(containerCapacity);
        if (capVal > 0) {
          const cCount = Math.round((order.quantity / capVal) * 10000) / 10000;
          setContainerQuantity(String(cCount));
        }
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
        container_quantity: num(containerQuantity) > 0 ? num(containerQuantity) : undefined,
        container_capacity: num(containerCapacity) > 0 ? num(containerCapacity) : undefined,
        primary_uom: containerUom.trim() || undefined,
        secondary_uom: measureUom.trim() || undefined,
        save_as_item_default: saveAsDefault,
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

  const cQtyNum = num(containerQuantity);
  const capNum = num(containerCapacity);
  const totalQtyNum = num(quantity);
  const costNum = num(unitCost);

  const containerCost = capNum > 0 && costNum > 0 ? capNum * costNum : 0;
  const totalCost = totalQtyNum > 0 && costNum > 0 ? totalQtyNum * costNum : 0;

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

            {/* Dual UOM / Container Capacity Section */}
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary/40 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-app-label-primary">
                  <Layers className="w-4 h-4 text-app-accent" />
                  <span>تحديد كميات وسعة الحاويات (Container & Measure UOM)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUomCustomizer((prev) => !prev)}
                  className="flex items-center gap-1 text-[11px] font-medium text-app-accent hover:opacity-80 transition-opacity"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{showUomCustomizer ? "إخفاء مسميات الوحدات" : "تعديل مسميات الوحدات"}</span>
                </button>
              </div>

              {showUomCustomizer && (
                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-app-bg-secondary border border-app-separator/60">
                  <div>
                    <label className="block text-[11px] font-medium text-app-label-secondary mb-1">
                      وحدة الحاوية / التعبئة (Container UOM)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: برميل، صندوق، طرد، رول"
                      value={containerUom}
                      onChange={(e) => setContainerUom(e.target.value)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs focus:border-app-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-app-label-secondary mb-1">
                      وحدة القياس الأساسية (Measure UOM)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: لتر، كغم، متر، m3"
                      value={measureUom}
                      onChange={(e) => setMeasureUom(e.target.value)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-2.5 py-1.5 text-xs focus:border-app-accent focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    عدد الحاويات {containerUom ? `(${containerUom})` : "(حاوية/طرد)"}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="مثال: 10"
                    value={containerQuantity}
                    onChange={(e) => handleContainerQuantityChange(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    سعة الحاوية {measureUom && containerUom ? `(${measureUom} / ${containerUom})` : "(سعة الحاوية)"}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="مثال: 200"
                    value={containerCapacity}
                    onChange={(e) => handleContainerCapacityChange(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    إجمالي كمية القياس {measureUom ? `(${measureUom})` : ""} <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    placeholder="مثال: 2000"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </div>
              </div>

              {cQtyNum > 0 && capNum > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-app-accent/10 border border-app-accent/20 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-app-accent">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span>
                      {formatNumber(cQtyNum)} {containerUom || "حاوية"} × {formatNumber(capNum)} {measureUom || "وحدة"} ={" "}
                      <strong className="font-bold">{formatNumber(totalQtyNum || cQtyNum * capNum)} {measureUom || "وحدة"}</strong>
                    </span>
                  </div>
                  {costNum > 0 && (
                    <div className="text-[11px] text-app-label-secondary font-mono">
                      تكلفة الحاوية: <span className="font-bold text-app-label-primary">{formatNumber(containerCost)} LYD</span>
                      {" | "}
                      الإجمالي: <span className="font-bold text-app-label-primary">{formatNumber(totalCost)} LYD</span>
                    </div>
                  )}
                </div>
              )}

              {selectedItem && capNum > 0 && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-app-label-secondary pt-0.5 select-none">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="rounded border-app-separator text-app-accent focus:ring-app-accent"
                  />
                  <span>
                    حفظ سعة الحاوية ({formatNumber(capNum)} {measureUom || "وحدة"} لكل {containerUom || "حاوية"}) كإعداد افتراضي للصنف
                  </span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                تكلفة وحدة القياس ({measureUom || "الوحدة"} - LYD) <span className="text-app-status-danger">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                required
                placeholder="تكلفة الوحدة (LYD)"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
              />
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
