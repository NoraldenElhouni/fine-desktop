import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventory";
import { InventoryItem, PRICE_BASIS_LABELS, UOM_LABELS } from "../../api/endpoints/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";

interface ProductPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onPick: (item: InventoryItem) => void;
}

/** Search the catalog (server-side) and see price and what is on this unit's shelves. */
export const ProductPickerDialog: React.FC<ProductPickerDialogProps> = ({ open, onClose, onPick }) => {
  const [search, setSearch] = useState("");
  const { data: items, isLoading } = useInventoryItems({ search: search || undefined, with_stock: 1, per_page: 50 });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>إضافة صنف إلى السلة</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-app-label-secondary" />
            <input
              type="text"
              autoFocus
              placeholder="البحث بالاسم أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="divide-y divide-app-separator max-h-[420px] overflow-y-auto rounded-xl border border-app-separator">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-app-label-secondary">جاري تحميل الأصناف...</div>
            ) : items?.data && items.data.length > 0 ? (
              items.data.map((i) => {
                const onHand = Number(i.available_quantity ?? 0);
                const hasPrice = i.selling_price !== null && i.selling_price !== undefined && i.selling_price !== "";
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => onPick(i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-start hover:bg-app-fill-f1 transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-app-label-primary truncate">{i.name}</span>
                      <span className="text-[10px] font-mono text-app-label-secondary mt-0.5">
                        {i.code}
                        {i.item_type === "foam_block" && <span className="ms-2 text-app-accent">· قالب إسفنج</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      <span className={`font-mono ${onHand > 0 ? "text-app-status-positive" : "text-app-status-danger"}`}>
                        {formatNumber(onHand)} {UOM_LABELS[i.unit_of_measure] ?? i.unit_of_measure}
                      </span>
                      <span className="font-mono text-app-label-secondary w-28 text-end">
                        {hasPrice
                          ? `${formatNumber(Number(i.selling_price))} ${PRICE_BASIS_LABELS[i.price_basis ?? "unit"]}`
                          : "بدون سعر"}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 font-bold text-app-accent">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-10 text-center text-xs text-app-label-secondary">لا توجد أصناف مطابقة للبحث.</div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
