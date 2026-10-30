import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter,
} from "../../components/ui/Dialog";
import {
  CutterWorkOrder, CutterRemnantInput, cutterCompletionErrorMessage, previewCutterSplit, remnantVolumeM3,
} from "../../api/endpoints/cutter";
import { useTransitionCutterOrder } from "../../hooks/useCutter";
import { formatNumber } from "../../lib/utils/format";

interface RemnantRow {
  key: number;
  l: string;
  w: string;
  h: string;
  /** The cut block it came from; "" means the order's first block. */
  lot: string;
}

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toRemnant = (r: RemnantRow): CutterRemnantInput => ({
  length_m: num(r.l),
  width_m: num(r.w),
  height_m: num(r.h),
  ...(r.lot ? { stock_lot_id: r.lot } : {}),
});

/** A row counts once all three sides are entered. */
const isFilled = (r: RemnantRow) => num(r.l) > 0 && num(r.w) > 0 && num(r.h) > 0;
const isBlank = (r: RemnantRow) => r.l === "" && r.w === "" && r.h === "";

interface Props {
  order: CutterWorkOrder | null;
  onClose: () => void;
}

/**
 * W4-06: completing a cutter order registers its usable remnants (restocked as
 * smaller blocks) and shows, live, how the order's block cost will split between
 * the cut pieces, the remnants and the weighed-in byproduct.
 */
export const CutterCompletionDialog: React.FC<Props> = ({ order, onClose }) => {
  const transitionMutation = useTransitionCutterOrder();
  const [rows, setRows] = useState<RemnantRow[]>([]);
  const [nextKey, setNextKey] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const filled = rows.filter(isFilled);
  const incomplete = rows.some((r) => !isFilled(r) && !isBlank(r));
  const tooSmall = rows.some((r) => {
    if (!isFilled(r)) return false;
    // The server takes sides of at least 0.01 m and a volume of at least 0.0001 m³.
    return num(r.l) < 0.01 || num(r.w) < 0.01 || num(r.h) < 0.01 || remnantVolumeM3(toRemnant(r)) <= 0;
  });

  const split = order ? previewCutterSplit(order, filled.map(toRemnant)) : null;

  if (!order || !split) return null;

  const close = () => {
    if (transitionMutation.isPending) return;
    setRows([]);
    setError(null);
    onClose();
  };

  const addRow = () => {
    setRows([...rows, { key: nextKey, l: "", w: "", h: "", lot: "" }]);
    setNextKey(nextKey + 1);
  };

  const updateRow = (key: number, field: "l" | "w" | "h" | "lot", value: string) =>
    setRows(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const removeRow = (key: number) => setRows(rows.filter((r) => r.key !== key));

  // An order that cut several blocks names each remnant's block, so the remnant
  // lot takes that block's item and grade and must fit inside it.
  const multiBlock = split.sourceBlocks.length > 1;
  const defaultBlock = split.sourceBlocks.find((b) => b.stockLotId === split.defaultBlockId);
  const unsizedBlocks = split.sourceBlocks.filter((b) => b.unsized);
  const overflowingBlocks = split.sourceBlocks.filter((b) => b.exceeded);
  const noBlockSize = filled.length > 0 && (split.blockVolume <= 0 || unsizedBlocks.length > 0);
  const blocked =
    incomplete || tooSmall || noBlockSize || split.noSourceBlock || split.exceedsBlocks || overflowingBlocks.length > 0;

  const submit = () => {
    if (blocked) return;
    setError(null);
    transitionMutation.mutate(
      { id: order.id, status: "completed", remnants: filled.map(toRemnant) },
      {
        onSuccess: () => {
          setRows([]);
          onClose();
        },
        onError: (e) => setError(cutterCompletionErrorMessage(e, "تعذر إكمال أمر العمل.", filled.length > 0)),
      },
    );
  };

  const remnantTotal = split.remnantCosts.reduce((s, v) => s + v, 0);
  const perKg = split.salvagedKg > 0 ? split.byproductCost / split.salvagedKg : 0;
  const share = (v: number) => (split.cost > 0 ? `${formatNumber((v / split.cost) * 100, { maximumFractionDigits: 1 })}%` : "—");

  return (
    <Dialog open onOpenChange={(next) => !next && close()}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div>
            <DialogTitle>
              إكمال أمر العمل <span className="font-mono text-app-accent">{order.order_number}</span>
            </DialogTitle>
            <DialogDescription>
              سجّل البقايا القابلة للاستخدام لتعود إلى المخزون كبلوكات أصغر. تتوزع تكلفة البلوكات المقطوعة حسب الحجم
              بين القطع والبقايا والمنتج الثانوي.
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>

        <DialogBody className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Remnant rows */}
          <div className="rounded-xl border border-app-separator">
            <div className="flex items-center justify-between border-b border-app-separator px-3 py-2">
              <h4 className="text-xs font-bold text-app-label-primary">بقايا قابلة للاستخدام</h4>
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= 50}
                className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-app-fill-f1 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5 text-app-accent" /> إضافة بقية
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-app-label-tertiary">
                لا توجد بقايا مسجلة — يتحمل القطع والمنتج الثانوي كامل التكلفة.
              </p>
            ) : (
              <div className="divide-y divide-app-separator">
                {rows.map((r, i) => {
                  const volume = isFilled(r) ? remnantVolumeM3(toRemnant(r)) : 0;
                  const filledIndex = filled.indexOf(r);
                  const cost = filledIndex >= 0 ? split.remnantCosts[filledIndex] ?? 0 : 0;
                  return (
                    <div
                      key={r.key}
                      className={`grid grid-cols-2 ${multiBlock ? "sm:grid-cols-7" : "sm:grid-cols-6"} items-end gap-2 p-3`}
                    >
                      <div className="text-xs font-mono text-app-label-tertiary self-center">#{i + 1}</div>
                      {multiBlock && (
                        <div>
                          <label className="block text-[10px] text-app-label-secondary mb-1">من البلوك</label>
                          <select
                            value={r.lot || split.defaultBlockId || ""}
                            onChange={(e) => updateRow(r.key, "lot", e.target.value)}
                            className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                          >
                            {split.sourceBlocks.map((b) => (
                              <option key={b.stockLotId} value={b.stockLotId}>
                                {b.lotNumber} · {b.blockVolume.toFixed(4)} م³
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {(["l", "w", "h"] as const).map((k) => (
                        <div key={k}>
                          <label className="block text-[10px] text-app-label-secondary mb-1">
                            {k === "l" ? "الطول" : k === "w" ? "العرض" : "الارتفاع"} (م)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.01"
                            value={r[k]}
                            onChange={(e) => updateRow(r.key, k, e.target.value)}
                            className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                          />
                        </div>
                      ))}
                      <div className="text-xs">
                        <div className="text-[10px] text-app-label-secondary mb-1">الحجم · التكلفة</div>
                        <div className="font-mono py-1.5 text-app-label-primary">
                          {volume.toFixed(4)} م³ · {formatNumber(cost)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(r.key)}
                        title="حذف البقية"
                        className="flex items-center justify-center rounded-lg border border-app-status-danger/30 bg-app-status-danger/10 px-2 py-1.5 text-app-status-danger hover:bg-app-status-danger/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {incomplete && (
            <p className="flex items-start gap-1.5 text-xs text-app-status-yellow">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              أكمل الطول والعرض والارتفاع لكل بقية، أو احذف الصف الفارغ.
            </p>
          )}
          {tooSmall && (
            <p className="flex items-start gap-1.5 text-xs text-app-status-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              كل ضلع لا يقل عن 0.01 م، وحجم البقية لا يقل عن 0.0001 م³.
            </p>
          )}
          {multiBlock && filled.length > 0 && (
            <p className="text-[11px] text-app-label-tertiary">
              قطع هذا الأمر {split.sourceBlocks.length} بلوكات — اختر لكل بقية البلوك الذي قُطعت منه، فتُخزَّن بصنفه
              ودرجته. الافتراضي البلوك الأول ({defaultBlock?.lotNumber ?? "—"}).
            </p>
          )}
          {split.noSourceBlock && filled.length > 0 && (
            <p className="flex items-start gap-1.5 text-xs text-app-status-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              لا يوجد بلوك مقطوع في هذا الأمر تُسجّل منه البقايا.
            </p>
          )}
          {noBlockSize && (
            <p className="flex items-start gap-1.5 text-xs text-app-status-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {unsizedBlocks.length > 0
                ? `البلوك ${unsizedBlocks.map((b) => b.lotNumber).join("، ")} ليس له أبعاد مسجلة، فلا يمكن تسعير بقايا منه.`
                : "البلوكات المقطوعة ليس لها أبعاد مسجلة، فلا يمكن تسعير بقايا منها."}
            </p>
          )}
          {/* With one block the total check above already says it. */}
          {(multiBlock || !split.exceedsBlocks) && overflowingBlocks.map((b) => (
            <p key={b.stockLotId} className="flex items-start gap-1.5 text-xs text-app-status-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {multiBlock
                ? `البقايا المحسوبة من البلوك ${b.lotNumber} (${b.remnantVolume.toFixed(4)} م³) أكبر من حجمه (${b.blockVolume.toFixed(4)} م³) — اختر البلوك الذي قُطعت منه كل بقية.`
                : `البقايا (${b.remnantVolume.toFixed(4)} م³) أكبر من حجم البلوك ${b.lotNumber} (${b.blockVolume.toFixed(4)} م³).`}
            </p>
          ))}
          {split.exceedsBlocks && (
            <p className="flex items-start gap-1.5 text-xs text-app-status-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              حجم القطع ({split.pieceVolume.toFixed(4)} م³) مع البقايا ({split.remnantVolume.toFixed(4)} م³) يتجاوز
              حجم البلوكات المقطوعة ({split.blockVolume.toFixed(4)} م³).
            </p>
          )}

          {/* Live split preview */}
          <div className="rounded-xl border border-app-separator bg-app-bg-secondary/40 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <h4 className="font-bold text-app-label-primary">معاينة توزيع التكلفة</h4>
              <span className="text-app-label-secondary">
                تكلفة البلوكات <span className="font-mono font-bold text-app-label-primary">{formatNumber(split.cost)} LYD</span>
                {" "}· حجمها <span className="font-mono">{split.blockVolume.toFixed(4)} م³</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2.5">
                <div className="text-[10px] text-app-label-tertiary">القطع</div>
                <div className="font-mono font-bold text-app-accent text-sm">{formatNumber(split.pieceCost)} LYD</div>
                <div className="font-mono text-[10px] text-app-label-secondary">
                  {split.pieceVolume.toFixed(4)} م³ · {share(split.pieceCost)}
                </div>
              </div>
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2.5">
                <div className="text-[10px] text-app-label-tertiary">البقايا ({filled.length})</div>
                <div className="font-mono font-bold text-app-label-primary text-sm">{formatNumber(remnantTotal)} LYD</div>
                <div className="font-mono text-[10px] text-app-label-secondary">
                  {split.remnantVolume.toFixed(4)} م³ · {share(remnantTotal)}
                </div>
              </div>
              <div className="rounded-lg border border-app-separator bg-app-bg-primary p-2.5">
                <div className="text-[10px] text-app-label-tertiary">المنتج الثانوي</div>
                <div className="font-mono font-bold text-app-label-primary text-sm">{formatNumber(split.byproductCost)} LYD</div>
                <div className="font-mono text-[10px] text-app-label-secondary">
                  {split.byproductVolume.toFixed(4)} م³ · {share(split.byproductCost)}
                  {split.salvagedKg > 0 && ` · ${formatNumber(perKg, { maximumFractionDigits: 4 })} LYD/كجم`}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-app-label-tertiary leading-relaxed">
              {split.salvagedKg > 0
                ? `يُسعَّر الحشو الموزون (${formatNumber(split.salvagedKg)} كجم) بنصيبه من الحجم المتبقي.`
                : "لم يُسترجع منتج ثانوي (الوزن 0)، فتبقى قيمة القصاصات على القطع."}
              {" "}التقريب يُضاف إلى القطع. هذه معاينة تقديرية — القيد الفعلي يحسبه الخادم عند الإكمال.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={close}
            disabled={transitionMutation.isPending}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={transitionMutation.isPending || blocked}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {transitionMutation.isPending ? "جاري الإكمال…" : "إكمال الأمر"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
