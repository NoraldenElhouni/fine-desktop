import React, { useState } from "react";
import { AlertTriangle, PackagePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStockIntake } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import { getImportOrders } from "../../api/endpoints/procurement";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { InventoryItem } from "../../api/endpoints/inventory";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
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
    queryKey: ["importOrders", "received"],
    queryFn: () => getImportOrders({ status: "received" }),
    enabled: source === "import_receipt",
  });
  const intakeMutation = useStockIntake();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    intakeMutation.mutate(
      {
        inventory_item_id: itemId,
        warehouse_id: warehouseId,
        lot_number: lotNumber,
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
                value={items.find((i) => i.id === itemId) ?? null}
                onChange={(item) => setItemId(item ? item.id : "")}
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
                  value={
                    warehouses?.find((w) => w.id === warehouseId) ?? null
                  }
                  onChange={(w) => setWarehouseId(w ? w.id : "")}
                  getOptionId={(w) => w.id}
                  getOptionLabel={(w) => w.name}
                  placeholder="المخزن…"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">رقم الدفعة (Lot Number)</label>
                <input
                  type="text" required placeholder="رقم الدفعة — LOT-1001"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-40 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">الكمية</label>
                <input
                  type="number" step="0.0001" min="0.0001" required placeholder="الكمية"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">تكلفة الوحدة (LYD)</label>
                <input
                  type="number" step="0.0001" min="0" required placeholder="تكلفة الوحدة (LYD)"
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
                  <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
                ))}
              </select>
            </div>

            {source === "import_receipt" && (
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">أمر الشراء المرتبط</label>
                <SearchableSelect<ImportOrder>
                  options={(importOrders as ImportOrder[]) ?? []}
                  value={
                    (importOrders as ImportOrder[])?.find?.(
                      (o) => o.id === importOrderId
                    ) ?? null
                  }
                  onChange={(o) => setImportOrderId(o ? o.id : "")}
                  getOptionId={(o) => o.id}
                  getOptionLabel={(o) => o.supplier?.name ?? "—"}
                  getOptionSubLabel={(o) =>
                    `الكمية: ${formatNumber(o.quantity)} | الإجمالي: ${formatNumber(getImportOrderTotal(o))} ${o.currency ?? ""}`
                  }
                  getOptionSearchText={(o) =>
                    `${o.supplier?.name ?? ""} ${o.currency ?? ""}`
                  }
                  placeholder="أمر الاستيراد المستلم…"
                  required
                />
              </div>
            )}
          </form>
        </DialogBody>

        <DialogFooter>
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="stock-intake-form"
            disabled={
              intakeMutation.isPending ||
              !itemId || !warehouseId || !lotNumber.trim() ||
              num(quantity) <= 0 ||
              (source === "import_receipt" && !importOrderId)
            }
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            {intakeMutation.isPending ? "جارٍ الاستلام…" : "استلام وقيد"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
