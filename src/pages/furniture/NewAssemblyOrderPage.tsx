import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, ArrowRight, Plus, Save, Sofa, Trash2 } from "lucide-react";
import { AsyncSearchableSelect } from "../../components/ui/AsyncSearchableSelect";
import { useCountableWarehouses } from "../../components/inventory/StockCountDialogs";
import { useBundles } from "../../hooks/useBundles";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  assemblyComponentLotsQuery,
  useAssemblyComponentLots,
  useCreateAssemblyOrder,
} from "../../hooks/useAssemblyOrders";
import type { AssemblyComponentLots } from "../../hooks/useAssemblyOrders";
import { inventoryApi, UOM_LABELS } from "../../api/endpoints/inventory";
import type { InventoryItem, StockLot } from "../../api/endpoints/inventory";
import {
  assemblyErrorMessage,
  lotMatchesSize,
  sizeLabel,
  type AssemblyOrderLineInput,
} from "../../api/endpoints/assemblyOrders";
import { toast } from "../../stores/toastStore";
import { formatNumber } from "../../lib/utils/format";

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:border-app-accent focus:outline-none";
const cellInputClass =
  "w-full rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-xs font-mono focus:border-app-accent focus:outline-none";
const labelClass = "block text-[11px] font-semibold text-app-label-secondary";

type ComponentItem = Pick<InventoryItem, "id" | "name" | "code" | "unit_of_measure"> & { item_type?: string };

interface LineDraft {
  key: string;
  item: ComponentItem | null;
  /** Quantity per finished unit, from the bundle template; null for a hand-entered line. */
  perUnit: number | null;
  /** A bundle row with no suggested quantity: the quantity must be typed, nothing is assumed. */
  noTemplateQty: boolean;
  /** The typed quantity; a bundle line follows perUnit × order quantity until it is typed over. */
  qty: string;
  qtyEdited: boolean;
  length: string;
  width: string;
  height: string;
  /** The hand-picked lot, or null to leave the pick to completion (oldest matching lot first). */
  lot: StockLot | null;
  /** A bundle row whose item did not load (soft-deleted): it must be removed or given another item. */
  itemDeleted: boolean;
}

let lineSeq = 0;
const newKey = () => `l${++lineSeq}`;

const emptyLine = (): LineDraft => ({
  key: newKey(),
  item: null,
  perUnit: null,
  noTemplateQty: false,
  qty: "",
  qtyEdited: false,
  length: "",
  width: "",
  height: "",
  lot: null,
  itemDeleted: false,
});

const round4 = (n: number) => Math.round(n * 10000) / 10000;
/** The backend's smallest quantity (4 decimals); a value that rounds below it is sent as 0 and refused. */
const MIN_QTY = 0.0001;
const qtyValid = (n: number) => !Number.isNaN(n) && round4(n) >= MIN_QTY;
const qty4 = (v: number | string | null | undefined) => formatNumber(v, { maximumFractionDigits: 4 });
const dimString = (v: number | string | null | undefined) => (v === null || v === undefined || v === "" ? "" : String(Number(v)));
const uom = (u?: string | null) => (u ? UOM_LABELS[u] ?? u : "");

/** The line's quantity as it will be sent. */
const lineQty = (line: LineDraft, orderQty: number): number =>
  line.perUnit !== null && !line.qtyEdited ? round4(line.perUnit * orderQty) : Number(line.qty);

/** The line's size, or null when no dimension is given; "invalid" when only some are, or one is not positive. */
const lineSize = (line: LineDraft): [number, number, number] | null | "invalid" => {
  const raw = [line.length, line.width, line.height].map((d) => d.trim());
  if (raw.every((d) => d === "")) return null;
  const dims = raw.map(Number);
  if (raw.some((d) => d === "") || dims.some((d) => Number.isNaN(d) || d <= 0)) return "invalid";
  return [dims[0], dims[1], dims[2]];
};

/** A bundle row's size, kept only when all three dimensions are positive (LotSize::of); otherwise none. */
const bundleRowSize = (row: { length_m?: number | string | null; width_m?: number | string | null; height_m?: number | string | null }) => {
  const dims = [row.length_m, row.width_m, row.height_m];
  const sized = dims.every((d) => d !== null && d !== undefined && d !== "" && Number(d) > 0);
  return sized
    ? { length: dimString(row.length_m), width: dimString(row.width_m), height: dimString(row.height_m) }
    : { length: "", width: "", height: "" };
};

/** What an automatic line leaves uncovered once every other line has drawn, as completion would draw. */
interface LineCover {
  /** Short counting only lots known to be drawable. */
  unmet: number;
  /** Short also counting lots whose production batch could not be confirmed closed. */
  unmetWithUnverified: number;
}

/**
 * A line's lot select: the component's available lots in the unit, of the
 * line's size when it has one, plus "automatic" (oldest matching lot first,
 * picked at completion). Also reports how much matching stock is on hand and,
 * for an automatic line, whether it is still covered after the other lines of
 * the same component take their share.
 */
const LineLotSelect: React.FC<{
  line: LineDraft;
  size: [number, number, number] | null;
  needed: number;
  cover?: LineCover;
  onPick: (lot: StockLot | null) => void;
}> = ({ line, size, needed, cover, onPick }) => {
  const { data, isLoading } = useAssemblyComponentLots(line.item?.id);
  const matching = useMemo(() => (data?.lots ?? []).filter((lot) => lotMatchesSize(size, lot)), [data, size]);
  // The pick as the current lot list has it (its quantity now); the snapshot only names it.
  const pickedId = line.lot?.id;
  const pick = pickedId ? matching.find((lot) => lot.id === pickedId) ?? null : null;
  // A refetch can drop the picked lot (consumed, quarantined, moved): clear the pick rather than send a stale id.
  const pickGone = data !== undefined && pickedId !== undefined && pick === null;
  /** The component whose hand-picked lot was dropped, to say so until the user picks again. */
  const [lostPickFor, setLostPickFor] = useState<string | null>(null);
  useEffect(() => {
    if (!pickGone) return;
    setLostPickFor(line.item?.id ?? null);
    onPick(null);
  }, [pickGone, line.item?.id, onPick]);
  const showLostPick = lostPickFor !== null && lostPickFor === line.item?.id && !line.lot;
  const unverified = data?.unverified;
  const isUnverified = (lot: StockLot) => unverified?.has(lot.id) ?? false;
  const available = matching.reduce((sum, lot) => (isUnverified(lot) ? sum : sum + Number(lot.quantity)), 0);
  const unverifiedQty = matching.reduce((sum, lot) => (isUnverified(lot) ? sum + Number(lot.quantity) : sum), 0);
  const verifiedCount = matching.filter((lot) => !isUnverified(lot)).length;
  // An automatic line is judged after the other lines of the component draw (completion's order);
  // otherwise against all matching stock.
  const short = cover ? cover.unmet > 0 : needed > 0 && available < needed;
  const maybeShort = short && (cover ? cover.unmetWithUnverified <= 0 : available + unverifiedQty >= needed);
  const sharedShort = cover !== undefined && cover.unmet > 0 && available >= needed;

  if (!line.item) return <span className="text-[11px] text-app-label-tertiary">اختر المكوّن أولاً</span>;

  return (
    <div className="space-y-1">
      <select
        value={pick?.id ?? ""}
        onChange={(e) => {
          setLostPickFor(null);
          onPick(matching.find((lot) => lot.id === e.target.value) ?? null);
        }}
        disabled={isLoading}
        className="w-full min-w-48 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-xs focus:border-app-accent focus:outline-none"
      >
        <option value="">تلقائي — الأقدم أولاً عند الإتمام</option>
        {matching.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lot.lot_number} — {qty4(lot.quantity)} {uom(line.item?.unit_of_measure)} × {formatNumber(lot.unit_cost, { maximumFractionDigits: 4 })} د.ل
            {lot.warehouse?.name ? ` — ${lot.warehouse.name}` : ""}
            {lot.bin_location ? ` (${lot.bin_location})` : ""}
            {isUnverified(lot) ? " — من تشغيلة إنتاج: يُقبل فقط إن كانت مغلقة" : ""}
          </option>
        ))}
      </select>
      {showLostPick && (
        <div className="text-[10px] font-semibold text-app-status-warning">
          اللوت المختار لم يعد متاحاً — اختر لوتاً آخر أو اتركه تلقائياً
        </div>
      )}
      {!isLoading && (
        <div
          className={`text-[10px] ${
            maybeShort ? "text-app-status-warning" : short ? "text-app-status-danger" : "text-app-label-tertiary"
          }`}
        >
          المتاح{size ? " بهذا المقاس" : ""}: <span className="font-mono">{qty4(available)}</span> في {formatNumber(verifiedCount)} لوت
          {unverifiedQty > 0 && (
            <>
              {" "}— و<span className="font-mono">{qty4(unverifiedQty)}</span> في لوتات تشغيلات إنتاج لم يُتحقق من إغلاقها (تُصرف فقط إن كانت مغلقة)
            </>
          )}
          {data && data.excludedOpenBatch > 0 ? ` — استُبعد ${formatNumber(data.excludedOpenBatch)} لوت من تشغيلات غير مغلقة` : ""}
          {data?.truncated ? " — القائمة جزئية: للصنف لوتات أكثر مما عُرض، فالمتاح أكبر مما يظهر" : ""}
          {pick && Number(pick.quantity) < needed ? " — اللوت المختار لا يكفي" : ""}
          {cover && cover.unmet > 0
            ? sharedShort
              ? ` — لا يكفي بعد ما تأخذه الأسطر الأخرى من هذا المكوّن: ينقص ${qty4(cover.unmet)}`
              : ` — ينقص ${qty4(cover.unmet)}`
            : ""}
        </div>
      )}
    </div>
  );
};

/**
 * Open a draft assembly order (W4-07): the finished furniture item, how many,
 * the warehouse it enters, and its components — prefilled from a bundle
 * template (suggested quantity × order quantity, with each row's size) or
 * entered by hand. Each component may name the lot to draw from; otherwise
 * completion draws the oldest matching lot. Nothing is reserved until then.
 */
export const NewAssemblyOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const create = useCreateAssemblyOrder();
  const queryClient = useQueryClient();
  const warehouses = useCountableWarehouses();
  const { data: bundles } = useBundles();

  const [finishedItem, setFinishedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [warehouseId, setWarehouseId] = useState("");
  const [source, setSource] = useState<"bundle" | "manual">("manual");
  const [bundleId, setBundleId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);

  // A single warehouse needs no choosing.
  useEffect(() => {
    if (!warehouseId && warehouses.length === 1) setWarehouseId(warehouses[0].id);
  }, [warehouses, warehouseId]);

  const orderQty = Number(quantity);
  const orderQtyValid = quantity.trim() !== "" && qtyValid(orderQty);

  const setLine = (key: string, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const fillFromBundle = (id: string) => {
    setBundleId(id);
    const bundle = (bundles ?? []).find((b) => b.id === id);
    if (!bundle) {
      setLines([emptyLine()]);
      return;
    }
    const rows = [...bundle.items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setLines(
      rows.length === 0
        ? [emptyLine()]
        : rows.map((row): LineDraft => ({
            key: newKey(),
            item: row.inventory_item
              ? {
                  id: row.inventory_item.id,
                  name: row.inventory_item.name,
                  code: row.inventory_item.code,
                  unit_of_measure: row.inventory_item.unit_of_measure,
                  item_type: row.inventory_item.item_type,
                }
              : // The row's item did not load (soft-deleted): no item, flagged below until replaced or removed.
                null,
            itemDeleted: !row.inventory_item,
            // A template row without a suggested quantity gets none: the user types it.
            perUnit: row.suggested_quantity != null && Number(row.suggested_quantity) > 0 ? Number(row.suggested_quantity) : null,
            noTemplateQty: !(row.suggested_quantity != null && Number(row.suggested_quantity) > 0),
            qty: "",
            qtyEdited: false,
            // A row with only some dimensions is unsized, as the backend's template path treats it.
            ...bundleRowSize(row),
            lot: null,
          })),
    );
  };

  const switchSource = (next: "bundle" | "manual") => {
    setSource(next);
    setBundleId("");
    setLines([emptyLine()]);
  };

  // The lots of every component on the form (shared with each line's lot select through the cache).
  const itemIds = [...new Set(lines.map((l) => l.item?.id).filter((id): id is string => Boolean(id)))];
  const lotQueries = useQueries({ queries: itemIds.map((id) => assemblyComponentLotsQuery(queryClient, id)) });
  const lotsByItem = new Map<string, AssemblyComponentLots>();
  /** Every loaded component's lots, current data, whether or not the list was cut short. */
  const loadedLots = new Map<string, AssemblyComponentLots>();
  itemIds.forEach((id, i) => {
    const data = lotQueries[i]?.data;
    if (data) loadedLots.set(id, data);
    // A cut-short list understates stock: no cover is worked out for it.
    if (data && !data.truncated) lotsByItem.set(id, data);
  });

  /**
   * The line's effective hand-picked lot, read from the current lot list (its quantity and cost as
   * they are now). A pick no longer among the component's matching lots counts as automatic; the
   * line's lot select clears it. Until the list loads, the snapshot taken at pick time stands in.
   */
  const effectivePick = (line: LineDraft, size: [number, number, number] | null | "invalid"): StockLot | null => {
    if (!line.lot || !line.item) return null;
    const data = loadedLots.get(line.item.id);
    if (!data) return line.lot;
    const pickedId = line.lot.id;
    const fresh = data.lots.find((lot) => lot.id === pickedId);
    return fresh && lotMatchesSize(size === "invalid" ? null : size, fresh) ? fresh : null;
  };

  // Per-line checks and the cost of what is already hand-picked.
  const checked = lines.map((line) => {
    const qty = orderQtyValid || line.perUnit === null || line.qtyEdited ? lineQty(line, orderQty) : NaN;
    const size = lineSize(line);
    const pick = effectivePick(line, size);
    const problems: string[] = [];
    if (line.itemDeleted && !line.item) problems.push("صنف هذا السطر محذوف — احذفه أو اختر صنفاً آخر");
    else if (!line.item) problems.push("اختر المكوّن");
    if (!qtyValid(qty)) problems.push("الكمية أكبر من صفر (0.0001 على الأقل)");
    if (size === "invalid") problems.push("المقاس: الأبعاد الثلاثة موجبة أو لا شيء");
    if (line.item && finishedItem && line.item.id === finishedItem.id) problems.push("المنتج لا يكون مكوّناً لنفسه");
    // Each foam block is its own lot of 1: a fraction would leave a part-block lot, which the backend refuses.
    if (line.item?.item_type === "foam_block" && qtyValid(qty) && !Number.isInteger(round4(qty))) {
      problems.push("البلوك الإسفنجي يُصرف كاملاً: الكمية عدد صحيح من البلوكات");
    }
    return { line, qty, size, pick, problems };
  });

  // The same lot hand-picked on several lines must hold all of them.
  const pickedByLot = new Map<string, { lot: StockLot; picked: number }>();
  for (const { pick, qty } of checked) {
    if (!pick || Number.isNaN(qty)) continue;
    const entry = pickedByLot.get(pick.id) ?? { lot: pick, picked: 0 };
    entry.picked = round4(entry.picked + qty);
    pickedByLot.set(pick.id, entry);
  }
  const overPicked = [...pickedByLot.values()].filter((e) => e.picked > Number(e.lot.quantity));

  // Replay completion's draw (AssemblyOrderService::complete): hand-picked lots are taken first, then
  // the automatic lines draw the oldest matching lot, sized lines before unsized ones, in line order.
  const replayDraw = (withUnverified: boolean): Map<string, number> => {
    const remaining = new Map<string, number>();
    lotsByItem.forEach((data) =>
      data.lots.forEach((lot) => {
        if (withUnverified || !data.unverified.has(lot.id)) remaining.set(lot.id, Number(lot.quantity));
      }),
    );
    for (const { pick, qty } of checked) {
      const left = pick ? remaining.get(pick.id) : undefined;
      if (pick && left !== undefined && !Number.isNaN(qty)) remaining.set(pick.id, round4(left - qty));
    }
    const open = checked.filter(
      (c) => !c.pick && c.line.item && lotsByItem.has(c.line.item.id) && qtyValid(c.qty) && c.size !== "invalid",
    );
    const unmet = new Map<string, number>();
    for (const c of [...open.filter((o) => o.size !== null), ...open.filter((o) => o.size === null)]) {
      const size = c.size === "invalid" ? null : c.size;
      let need = round4(c.qty);
      for (const lot of lotsByItem.get((c.line.item as ComponentItem).id)?.lots ?? []) {
        if (need <= 0) break;
        const left = remaining.get(lot.id);
        if (left === undefined || !lotMatchesSize(size, lot)) continue;
        const take = round4(Math.min(left, need));
        if (take <= 0) continue;
        remaining.set(lot.id, round4(left - take));
        need = round4(need - take);
      }
      unmet.set(c.line.key, need);
    }
    return unmet;
  };
  const unmetVerified = replayDraw(false);
  const unmetAll = replayDraw(true);
  const coverOf = (key: string): LineCover | undefined => {
    const unmet = unmetVerified.get(key);
    return unmet === undefined ? undefined : { unmet, unmetWithUnverified: unmetAll.get(key) ?? unmet };
  };

  // The automatic lines stock cannot cover, per component and size (as completion reports them).
  const shortByComponent = new Map<string, { label: string; unmet: number; coveredIfUnverified: boolean }>();
  for (const { line, size } of checked) {
    const cover = coverOf(line.key);
    if (!cover || cover.unmet <= 0 || !line.item) continue;
    const dims = Array.isArray(size) ? sizeLabel(size[0], size[1], size[2]) : null;
    const key = `${line.item.id}|${Array.isArray(size) ? size.join("x") : ""}`;
    const entry = shortByComponent.get(key) ?? {
      label: `${line.item.code || line.item.name}${dims ? ` ${dims}` : ""}`,
      unmet: 0,
      coveredIfUnverified: true,
    };
    entry.unmet = round4(entry.unmet + cover.unmet);
    entry.coveredIfUnverified = entry.coveredIfUnverified && cover.unmetWithUnverified <= 0;
    shortByComponent.set(key, entry);
  }
  const shortfalls = [...shortByComponent.values()];

  const pickedCost = checked.reduce(
    (sum, { pick, qty }) => (pick && !Number.isNaN(qty) ? sum + qty * Number(pick.unit_cost) : sum),
    0,
  );
  const pickedLines = checked.filter(({ pick }) => pick).length;

  const formProblems: string[] = [];
  if (!finishedItem) formProblems.push("اختر المنتج النهائي.");
  if (!orderQtyValid) formProblems.push("كمية الإنتاج يجب أن تكون أكبر من صفر (0.0001 على الأقل).");
  if (!warehouseId) formProblems.push("اختر مخزن الإنتاج.");
  if (source === "bundle" && !bundleId) formProblems.push("اختر الحزمة.");
  if (lines.length === 0) formProblems.push("أضف مكوّناً واحداً على الأقل.");
  const lineProblems = checked.filter((c) => c.problems.length > 0).length;

  const canSubmit = formProblems.length === 0 && lineProblems === 0 && !create.isPending;

  const handleSubmit = () => {
    if (!canSubmit || !finishedItem) return;
    setError(null);
    const payloadLines: AssemblyOrderLineInput[] = checked.map(({ line, qty, size, pick }) => ({
      inventory_item_id: (line.item as ComponentItem).id,
      quantity: round4(qty),
      stock_lot_id: pick?.id ?? null,
      length_m: Array.isArray(size) ? size[0] : null,
      width_m: Array.isArray(size) ? size[1] : null,
      height_m: Array.isArray(size) ? size[2] : null,
    }));
    create.mutate(
      {
        finished_item_id: finishedItem.id,
        quantity: round4(orderQty),
        output_warehouse_id: warehouseId,
        bundle_id: source === "bundle" ? bundleId : null,
        notes: notes.trim() || null,
        lines: payloadLines,
      },
      {
        onSuccess: (order) => {
          toast.success(`تم فتح أمر التجميع ${order.number}`);
          navigate(`/furniture/assembly/${order.id}`, { replace: true });
        },
        onError: (err) => setError(assemblyErrorMessage(err, "تعذّر فتح أمر التجميع.")),
      },
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <button
        onClick={() => navigate("/furniture/assembly")}
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى أوامر التجميع
      </button>

      <div>
        <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
          <Sofa className="w-6 h-6 text-app-accent" />
          أمر تجميع جديد
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          يُفتح الأمر مسودة لا تحجز شيئاً. عند الإتمام تُصرف المكونات من لوتاتها (المختار، أو الأقدم المطابق للمقاس)، ويدخل لوت المنتج التام مخزن الإنتاج بمجموع تكلفتها الفعلية.
        </p>
      </div>

      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-app-separator bg-app-bg-primary p-4">
        <div className="space-y-1">
          <label className={labelClass}>
            المنتج النهائي (منتج أثاث تام) <span className="text-app-status-danger">*</span>
          </label>
          <AsyncSearchableSelect<InventoryItem>
            value={finishedItem}
            onChange={setFinishedItem}
            queryKey={["assemblyFinishedItems"]}
            fetcher={async ({ search, page }) => {
              const res = await inventoryApi.getItems({
                item_type: "furniture_finished_good",
                search: search || undefined,
                page,
                per_page: 20,
              });
              return { data: res.data.data, hasMore: res.data.current_page < res.data.last_page };
            }}
            getOptionId={(i) => i.id}
            getOptionLabel={(i) => `${i.name} (${i.code})`}
            placeholder="ابحث باسم المنتج أو رمزه…"
            emptyMessage="لا توجد أصناف «منتج أثاث تام» — عرّفها من إعدادات المنتجات."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>
              الكمية المنتَجة <span className="text-app-status-danger">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`${inputClass} font-mono`}
              dir="ltr"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>
              مخزن الإنتاج <span className="text-app-status-danger">*</span>
            </label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className={inputClass}>
              <option value="">اختر…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>مصدر المكونات</label>
          <div className="flex gap-2">
            {(["manual", "bundle"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => switchSource(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  source === s
                    ? "bg-app-accent text-white"
                    : "border border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                }`}
              >
                {s === "manual" ? "إدخال يدوي" : "من قالب حزمة"}
              </button>
            ))}
          </div>
          {source === "bundle" && (
            <select value={bundleId} onChange={(e) => fillFromBundle(e.target.value)} className={inputClass}>
              <option value="">اختر الحزمة…</option>
              {(bundles ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({formatNumber(b.items.length)} مكوّن)
                </option>
              ))}
            </select>
          )}
          {source === "bundle" && bundleId && (
            <p className="text-[10px] text-app-label-tertiary">
              كمية كل مكوّن = الكمية المقترحة في الحزمة × الكمية المنتَجة، وتتبع الكمية المنتَجة ما لم تعدّلها.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            rows={2}
            className={inputClass}
          />
        </div>
      </div>

      {/* Components */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-label-primary">المكونات ({formatNumber(lines.length)})</h2>
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة مكوّن
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-3 py-3 text-start w-8">#</th>
                <th className="px-3 py-3 text-start min-w-56">المكوّن</th>
                <th className="px-3 py-3 text-start w-28">الكمية</th>
                <th className="px-3 py-3 text-start w-56">المقاس (م) — اختياري</th>
                <th className="px-3 py-3 text-start">اللوت</th>
                <th className="px-3 py-3 text-end">التكلفة التقديرية</th>
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {checked.map(({ line, qty, size, pick, problems }, index) => (
                <tr key={line.key} className="align-top">
                  <td className="px-3 py-2 font-mono text-app-label-tertiary">{index + 1}</td>
                  <td className="px-3 py-2">
                    <AsyncSearchableSelect<ComponentItem>
                      value={line.item}
                      onChange={(next) => setLine(line.key, { item: next, lot: null, itemDeleted: false })}
                      queryKey={["assemblyComponentItems"]}
                      fetcher={async ({ search, page }) => {
                        const res = await inventoryApi.getItems({ search: search || undefined, page, per_page: 20 });
                        return { data: res.data.data, hasMore: res.data.current_page < res.data.last_page };
                      }}
                      getOptionId={(i) => i.id}
                      getOptionLabel={(i) => (i.code ? `${i.name} (${i.code})` : i.name)}
                      getOptionDisabled={(i) => i.id === finishedItem?.id}
                      placeholder="ابحث باسم الصنف أو رمزه…"
                      size="sm"
                    />
                    {problems.length > 0 && (
                      <div className="mt-1 text-[10px] text-app-status-danger">{problems.join(" · ")}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={line.perUnit !== null && !line.qtyEdited ? (orderQtyValid ? String(qty) : "") : line.qty}
                      onChange={(e) => setLine(line.key, { qty: e.target.value, qtyEdited: true })}
                      className={cellInputClass}
                      dir="ltr"
                    />
                    <div className="mt-0.5 text-[10px] text-app-label-tertiary">
                      {uom(line.item?.unit_of_measure)}
                      {line.perUnit !== null && (line.qtyEdited ? " · معدّلة يدوياً" : ` · ${qty4(line.perUnit)} لكل وحدة`)}
                    </div>
                    {line.noTemplateQty && line.qty.trim() === "" && (
                      <div className="mt-0.5 text-[10px] font-semibold text-app-status-warning">
                        الكمية غير محددة في الحزمة — أدخلها
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1" dir="ltr">
                      {(["length", "width", "height"] as const).map((dim) => (
                        <input
                          key={dim}
                          type="number"
                          min={0}
                          step="any"
                          value={line[dim]}
                          onChange={(e) => setLine(line.key, { [dim]: e.target.value, lot: null })}
                          placeholder={dim === "length" ? "ط" : dim === "width" ? "ع" : "س"}
                          className={`${cellInputClass} w-16 ${size === "invalid" ? "border-app-status-danger" : ""}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <LineLotSelect
                      line={line}
                      size={size === "invalid" ? null : size}
                      needed={Number.isNaN(qty) ? 0 : qty}
                      cover={coverOf(line.key)}
                      onPick={(lot) => setLine(line.key, { lot })}
                    />
                  </td>
                  <td className="px-3 py-2 text-end font-mono">
                    {pick && !Number.isNaN(qty) ? (
                      `${formatNumber(qty * Number(pick.unit_cost))} د.ل`
                    ) : (
                      <span className="text-[10px] text-app-label-tertiary">عند الإتمام</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                      className="rounded-lg p-1 text-app-label-tertiary hover:bg-app-status-danger/10 hover:text-app-status-danger"
                      aria-label="حذف المكوّن"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-secondary">
                    لا توجد مكونات — أضف مكوّناً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-xs">
          <span className="text-app-label-secondary">
            تكلفة اللوتات المختارة ({formatNumber(pickedLines)} من {formatNumber(lines.length)} سطر):{" "}
            <span className="font-mono font-bold text-app-label-primary">{formatNumber(pickedCost)} د.ل</span>
            {orderQtyValid && pickedLines === lines.length && lines.length > 0 && (
              <>
                {" "}— للوحدة: <span className="font-mono font-bold text-app-label-primary">{formatNumber(pickedCost / orderQty, { maximumFractionDigits: 4 })} د.ل</span>
              </>
            )}
          </span>
          <span className="text-[10px] text-app-label-tertiary">
            التكلفة الفعلية تُحسب عند الإتمام من لوتات الصرف، والأسطر التلقائية تأخذ الأقدم المطابق.
          </span>
        </div>
      </div>

      {overPicked.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {overPicked
            .map((e) => `اللوت ${e.lot.lot_number}: مختار ${qty4(e.picked)} ويحمل ${qty4(e.lot.quantity)} فقط`)
            .join(" · ")}
          — سيُرفض الإتمام ما لم يتوفر الفرق.
        </div>
      )}

      {shortfalls.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            المخزون المتاح لا يغطي الأسطر التلقائية بعد ما تأخذه الأسطر الأخرى:{" "}
            {shortfalls
              .map((e) => `${e.label}: ينقص ${qty4(e.unmet)}${e.coveredIfUnverified ? " (يكفي إن كانت تشغيلات الإنتاج غير المتحقق منها مغلقة)" : ""}`)
              .join(" · ")}
            {" "}— سيُرفض الإتمام ما لم يتوفر الفرق.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-app-status-danger/15 border border-app-status-danger/30 p-3 text-xs font-bold text-app-status-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {formProblems.length > 0 && (
          <span className="text-[11px] text-app-label-tertiary">{formProblems.join(" ")}</span>
        )}
        <button
          type="button"
          onClick={() => navigate("/furniture/assembly")}
          className="rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
        >
          تراجع
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {create.isPending ? "جاري الحفظ..." : "فتح أمر التجميع"}
        </button>
      </div>
    </div>
  );
};
