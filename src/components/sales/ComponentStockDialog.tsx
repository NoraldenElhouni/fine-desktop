import React, { useEffect, useState } from "react";
import { Package, PackageCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";
import { useMatchingStock, useReserveComponent } from "../../hooks/useSales";
import { SaleComponent, formatSizeCm } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";

interface ComponentStockDialogProps {
  component: SaleComponent | null;
  itemName?: string;
  onClose: () => void;
}

/** Matching stock for one piece, in this unit or the cutter that serves it — pick lots that cover the whole quantity. */
export const ComponentStockDialog: React.FC<ComponentStockDialogProps> = ({ component, itemName, onClose }) => {
  const { data, isLoading } = useMatchingStock(component?.id);
  const reserve = useReserveComponent();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected({});
    setError(null);
  }, [component?.id]);

  if (!component) return null;

  const needed = Number(component.quantity);
  const picked = Object.values(selected).reduce((s, q) => s + q, 0);
  const size = formatSizeCm(component.length_m, component.width_m, component.height_m);

  const toggle = (lotId: string, available: number, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[lotId];
        return next;
      }
      next[lotId] = Math.min(available, needed - picked + (prev[lotId] ?? 0));
      return next;
    });
  };

  const confirm = () => {
    setError(null);
    reserve.mutate(
      {
        componentId: component.id,
        allocations: Object.entries(selected).map(([stock_lot_id, quantity]) => ({ stock_lot_id, quantity })),
      },
      { onSuccess: onClose, onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذّر حجز القطع.") },
    );
  };

  return (
    <Dialog open={Boolean(component)} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <div>
            <DialogTitle>تجهيز من المخزون</DialogTitle>
            <DialogDescription>
              {itemName} {size && <span className="font-mono">— {size}</span>} — المطلوب{" "}
              <span className="font-mono font-bold">{formatNumber(needed)}</span>
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3">
          {error && <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">{error}</div>}

          {isLoading ? (
            <div className="py-10 text-center text-xs text-app-label-secondary">جارٍ البحث…</div>
          ) : !data || data.lots.length === 0 ? (
            <div className="py-10 text-center text-xs text-app-label-tertiary">
              لا توجد قطع مطابقة في المخزون بهذا المقاس — يمكن إرسال هذه القطعة للمقص بدلاً من ذلك.
            </div>
          ) : (
            <div className="divide-y divide-app-separator rounded-xl border border-app-separator max-h-[360px] overflow-y-auto">
              {data.lots.map((lot) => {
                const checked = lot.id in selected;
                return (
                  <label key={lot.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-app-fill-f1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggle(lot.id, lot.quantity, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Package className="h-3.5 w-3.5 text-app-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold">{lot.lot_number}</div>
                      <div className="text-[10px] text-app-label-secondary">
                        {lot.warehouse} — {lot.operating_unit}
                        {lot.grade && ` · ${lot.grade}`}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <div className="text-xs font-mono">متاح {formatNumber(lot.quantity)}</div>
                      {checked && (
                        <input
                          type="number"
                          min="0.0001"
                          max={lot.quantity}
                          step="any"
                          value={selected[lot.id]}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [lot.id]: Number(e.target.value) }))}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-20 rounded-lg border border-app-separator bg-app-bg-secondary px-1.5 py-0.5 text-[11px] font-mono"
                        />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className={`text-xs font-semibold ${picked === needed ? "text-app-status-positive" : "text-app-label-secondary"}`}>
            المختار {formatNumber(picked)} من {formatNumber(needed)}
          </div>
        </DialogBody>
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
            إلغاء
          </button>
          <button
            onClick={confirm}
            disabled={picked !== needed || reserve.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            <PackageCheck className="h-4 w-4" />
            {reserve.isPending ? "جارٍ الحجز…" : "تأكيد الحجز"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
