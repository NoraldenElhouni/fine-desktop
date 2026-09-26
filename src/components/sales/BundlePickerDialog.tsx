import React, { useState } from "react";
import { ArrowRight, Boxes, Calculator, Plus, Search } from "lucide-react";
import { useBundles } from "../../hooks/useBundles";
import { Bundle } from "../../api/endpoints/bundles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";
import { splitBundlePrice } from "../../lib/utils/bundlePricing";

export interface BundlePickLine {
  inventoryItemId: string;
  name: string;
  code?: string;
  quantity: number;
  unitPrice: number;
  bundleId: string;
}

interface BundlePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (lines: BundlePickLine[]) => void;
}

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const BundlePickerDialog: React.FC<BundlePickerDialogProps> = ({ open, onClose, onAdd }) => {
  const [search, setSearch] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [combinedPrice, setCombinedPrice] = useState("");

  const { data: bundles, isLoading } = useBundles({ search: search || undefined });

  const reset = () => {
    setSearch("");
    setSelectedBundle(null);
    setQuantities({});
    setCombinedPrice("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickBundle = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    const initial: Record<string, string> = {};
    bundle.items.forEach((i) => {
      initial[i.id] = i.suggested_quantity ? String(i.suggested_quantity) : "1";
    });
    setQuantities(initial);
  };

  const lines = selectedBundle
    ? selectedBundle.items.map((i) => ({
        bundleItemId: i.id,
        inventoryItemId: i.inventory_item_id,
        name: i.inventory_item?.name ?? "",
        code: i.inventory_item?.code,
        quantity: num(quantities[i.id] ?? "0"),
      }))
    : [];

  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);
  const price = num(combinedPrice);
  const canConfirm = selectedBundle !== null && totalQty > 0 && price > 0;

  const handleConfirm = () => {
    if (!selectedBundle || !canConfirm) return;
    const totals = splitBundlePrice(lines, price);
    const result: BundlePickLine[] = lines.map((l, idx) => ({
      inventoryItemId: l.inventoryItemId,
      name: l.name,
      code: l.code,
      quantity: l.quantity,
      unitPrice: l.quantity > 0 ? Math.round((totals[idx] / l.quantity) * 10000) / 10000 : 0,
      bundleId: selectedBundle.id,
    })).filter((l) => l.quantity > 0);

    onAdd(result);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {selectedBundle ? `حزمة: ${selectedBundle.name}` : "إضافة حزمة"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {!selectedBundle ? (
            <>
              <div className="relative">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-app-label-secondary" />
                <input
                  type="text"
                  autoFocus
                  placeholder="البحث باسم الحزمة…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="divide-y divide-app-separator max-h-[420px] overflow-y-auto rounded-xl border border-app-separator">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-app-label-secondary">جاري تحميل الحزم...</div>
                ) : bundles && bundles.length > 0 ? (
                  bundles.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => pickBundle(b)}
                      className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-app-fill-f1 transition-colors"
                    >
                      <div className="flex flex-col pe-2">
                        <span className="text-xs font-semibold text-app-label-primary">{b.name}</span>
                        <span className="text-[10px] text-app-label-secondary mt-0.5">
                          {b.items.map((i) => i.inventory_item?.name).filter(Boolean).join("، ") || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-bold text-app-accent shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                        <span>اختيار</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-10 text-center text-xs text-app-label-secondary">لا توجد حزم مطابقة للبحث.</div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedBundle(null)}
                className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                اختيار حزمة أخرى
              </button>

              <div className="rounded-xl border border-app-separator overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-app-bg-secondary text-xs font-bold text-app-label-primary">
                  <Boxes className="h-4 w-4 text-app-accent" />
                  أصناف الحزمة — عدّل الكمية عند الحاجة
                </div>
                <div className="divide-y divide-app-separator">
                  {selectedBundle.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-app-label-primary">{i.inventory_item?.name}</div>
                        {i.inventory_item?.code && (
                          <div className="text-[10px] font-mono text-app-label-secondary">{i.inventory_item.code}</div>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quantities[i.id] ?? ""}
                        onChange={(e) => setQuantities((prev) => ({ ...prev, [i.id]: e.target.value }))}
                        className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center focus:border-app-accent focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  السعر الإجمالي للحزمة
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="مثال: 1500"
                  value={combinedPrice}
                  onChange={(e) => setCombinedPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
                <p className="text-[11px] text-app-label-tertiary mt-1">
                  السعر يُوزَّع تلقائيًا على الأصناف حسب الكمية — السعر لكل وحدة موحّد داخل الحزمة.
                </p>
              </div>

              {canConfirm && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-app-accent/10 border border-app-accent/20 text-xs text-app-accent">
                  <Calculator className="w-4 h-4 shrink-0" />
                  <span>
                    {formatNumber(totalQty)} وحدة بسعر {" "}
                    <strong className="font-bold font-mono">{formatNumber(price / totalQty)}</strong>
                    {" "}للوحدة = {" "}
                    <strong className="font-bold font-mono">{formatNumber(price)}</strong>
                  </span>
                </div>
              )}
            </>
          )}
        </DialogBody>
        {selectedBundle && (
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              إضافة إلى السلة
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
