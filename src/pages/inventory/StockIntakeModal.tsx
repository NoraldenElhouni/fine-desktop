import React, { useState } from "react";
import { AlertTriangle, PackagePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStockIntake } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import { getImportOrders } from "../../api/endpoints/procurement";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { InventoryItem } from "../../api/endpoints/inventory";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-app-label-primary flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-app-accent" />
          استلام مخزون (Stock Intake)
        </h3>
        <p className="text-xs text-app-label-secondary">
          الكمية تدخل كدفعة في المخزن مع حركة مخزون وقيد محاسبي حسب المصدر.
          استلام أوامر الاستيراد لا يُقيد مرتين — قيمته سُجلت عند إغلاق الأمر.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <select
            required value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
          >
            <option value="">الصنف…</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              required value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
            >
              <option value="">المخزن…</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <input
              type="text" required placeholder="رقم الدفعة — LOT-1001"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              className="w-40 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number" step="0.0001" min="0.0001" required placeholder="الكمية"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
            />
            <input
              type="number" step="0.0001" min="0" required placeholder="تكلفة الوحدة (LYD)"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="flex-1 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-mono focus:border-app-accent focus:outline-none"
            />
          </div>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as IntakeSource)}
            className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
          >
            {(Object.keys(SOURCE_LABEL) as IntakeSource[]).map((s) => (
              <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
            ))}
          </select>

          {source === "import_receipt" && (
            <select
              required value={importOrderId}
              onChange={(e) => setImportOrderId(e.target.value)}
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none"
            >
              <option value="">أمر الاستيراد المستلم…</option>
              {importOrders?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.supplier?.name} — {Number(o.quantity)} × {Number(o.negotiated_price)} {o.currency}
                </option>
              ))}
            </select>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
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
          </div>
        </form>
      </div>
    </div>
  );
};
