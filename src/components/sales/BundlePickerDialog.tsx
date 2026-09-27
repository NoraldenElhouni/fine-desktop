import React, { useState } from "react";
import { Boxes, Plus, Search } from "lucide-react";
import { useBundles } from "../../hooks/useBundles";
import { Bundle } from "../../api/endpoints/bundles";
import { suggestedPrice } from "../../api/endpoints/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from "../ui/Dialog";
import { formatNumber } from "../../lib/utils/format";

interface BundlePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onPick: (bundle: Bundle, suggestedTotal: number | null) => void;
}

/**
 * What a bundle's template rows are worth at their items' own prices — the
 * starting price for the cart line. Null when any row cannot be priced.
 */
export function bundleSuggestedTotal(bundle: Bundle): number | null {
  if (bundle.items.length === 0) return null;
  let total = 0;
  for (const row of bundle.items) {
    if (!row.inventory_item) return null;
    const price = suggestedPrice(row.inventory_item, Number(row.suggested_quantity ?? 1), {
      length_m: row.length_m ? Number(row.length_m) : null,
      width_m: row.width_m ? Number(row.width_m) : null,
      height_m: row.height_m ? Number(row.height_m) : null,
    });
    if (price === null) return null;
    total += price;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Picks a bundle for the cart. The cart shows the bundle as one line with its
 * name; what it contains is defined after checkout.
 */
export const BundlePickerDialog: React.FC<BundlePickerDialogProps> = ({ open, onClose, onPick }) => {
  const [search, setSearch] = useState("");
  const { data: bundles, isLoading } = useBundles({ search: search || undefined });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-app-accent" />
            إضافة حزمة
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
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
          <p className="text-[11px] text-app-label-tertiary">
            تظهر الحزمة في السلة والفاتورة كسطر واحد باسمها. يُحدَّد محتواها (القطع والمقاسات) بعد إتمام البيع.
          </p>

          <div className="divide-y divide-app-separator max-h-[420px] overflow-y-auto rounded-xl border border-app-separator">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-app-label-secondary">جاري تحميل الحزم...</div>
            ) : bundles && bundles.length > 0 ? (
              bundles.map((b) => {
                const total = bundleSuggestedTotal(b);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onPick(b, total);
                      setSearch("");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-app-fill-f1 transition-colors"
                  >
                    <div className="flex flex-col pe-2">
                      <span className="text-xs font-semibold text-app-label-primary">{b.name}</span>
                      <span className="text-[10px] text-app-label-secondary mt-0.5">
                        {b.items.map((i) => i.inventory_item?.name).filter(Boolean).join("، ") || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {total !== null && (
                        <span className="text-[11px] font-mono text-app-label-secondary">~{formatNumber(total)} د.ل</span>
                      )}
                      <span className="flex items-center gap-1.5 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-bold text-app-accent">
                        <Plus className="w-3.5 h-3.5" />
                        إضافة
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-10 text-center text-xs text-app-label-secondary">لا توجد حزم مطابقة للبحث.</div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
