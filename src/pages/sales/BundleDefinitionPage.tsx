import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Boxes, Calculator, Copy, Package, Plus, Scissors, Trash2, Truck,
} from "lucide-react";
import {
  useDefineBundle, useDeliverBundle, useReleaseComponent, useSale,
} from "../../hooks/useSales";
import { COMPONENT_STATUS_LABEL, SaleComponent, formatSizeCm } from "../../api/endpoints/sales";
import { InventoryItem, inventoryApi, suggestedPrice } from "../../api/endpoints/inventory";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import { AsyncSearchableSelect } from "../../components/ui/AsyncSearchableSelect";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ComponentStockDialog } from "../../components/sales/ComponentStockDialog";
import { SendToCutterDialog } from "../../components/sales/SendToCutterDialog";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Metres ↔ centimetres — the counter always types cm; the API stores metres. */
const m = (cm: string): number | null => (cm.trim() ? Number(cm) / 100 : null);
const cm = (metres?: number | string | null): string => (metres ? String(Math.round(Number(metres) * 1000) / 10) : "");

interface DefinitionRow {
  key: string;
  item: InventoryItem | null;
  qty: string;
  l: string;
  w: string;
  h: string;
  notes: string;
}

const emptyRow = (): DefinitionRow => ({ key: crypto.randomUUID(), item: null, qty: "1", l: "", w: "", h: "", notes: "" });

const CUTTABLE_TYPES = ["cut_template_piece", "slice"];

export const BundleDefinitionPage: React.FC = () => {
  const { saleId, lineId } = useParams<{ saleId: string; lineId: string }>();
  const navigate = useNavigate();

  const { data: sale, isLoading } = useSale(saleId);
  const defineBundle = useDefineBundle();
  const releaseComponent = useReleaseComponent();
  const deliverBundle = useDeliverBundle();

  const [rows, setRows] = useState<DefinitionRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockDialogComponent, setStockDialogComponent] = useState<SaleComponent | null>(null);
  const [cutterSelection, setCutterSelection] = useState<Set<string>>(new Set());
  const [cutterDialogOpen, setCutterDialogOpen] = useState(false);

  const line = sale?.lines?.find((l) => l.id === lineId);
  const components = line?.components ?? [];
  const isDefined = components.length > 0;
  const isLocked = components.some((c) => c.status !== "pending");

  // Pre-fill from the bundle's template the first time, or from the saved components when editing.
  useEffect(() => {
    if (!line) return;
    if (isDefined && !editing) return;

    if (isDefined) {
      setRows(
        components.map((c) => ({
          key: c.id,
          item: c.inventory_item as InventoryItem | null,
          qty: String(Number(c.quantity)),
          l: cm(c.length_m),
          w: cm(c.width_m),
          h: cm(c.height_m),
          notes: c.notes ?? "",
        })),
      );
      return;
    }

    const template = line.bundle?.items ?? [];
    setRows(
      template.length > 0
        ? template.map((t) => ({
            key: crypto.randomUUID(),
            item: (t.inventory_item as InventoryItem) ?? null,
            qty: t.suggested_quantity ? String(Number(t.suggested_quantity)) : "1",
            l: cm(t.length_m),
            w: cm(t.width_m),
            h: cm(t.height_m),
            notes: "",
          }))
        : [emptyRow()],
    );
  }, [line, isDefined, editing]);

  const referenceTotal = useMemo(
    () =>
      rows.reduce((sum, r) => {
        if (!r.item) return sum;
        const size = r.l && r.w && r.h ? { length_m: m(r.l) ?? 0, width_m: m(r.w) ?? 0, height_m: m(r.h) ?? 0 } : undefined;
        const price = suggestedPrice(r.item, num(r.qty), size);
        return price !== null ? sum + price : sum;
      }, 0),
    [rows],
  );

  if (isLoading || !sale || !line) {
    return <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary" dir="rtl">جاري التحميل…</div>;
  }

  const soldPrice = Number(line.unit_price) * Number(line.quantity);
  const difference = referenceTotal - soldPrice;

  const rowsValid = rows.length > 0 && rows.every((r) => r.item && num(r.qty) > 0);

  const save = () => {
    setError(null);
    defineBundle.mutate(
      {
        saleId: saleId as string,
        lineId: lineId as string,
        components: rows.map((r) => ({
          inventory_item_id: (r.item as InventoryItem).id,
          quantity: num(r.qty),
          length_m: m(r.l),
          width_m: m(r.w),
          height_m: m(r.h),
          notes: r.notes.trim() || null,
        })),
      },
      {
        onSuccess: () => { toast.success("تم حفظ محتوى الحزمة"); setEditing(false); },
        onError: (err) => setError(apiErrorPayload(err)?.message ?? "تعذّر حفظ محتوى الحزمة."),
      },
    );
  };

  const toggleCutterSelection = (id: string) =>
    setCutterSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const readyCount = components.filter((c) => c.status === "ready").length;
  const canDeliver = readyCount > 0;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <button
          onClick={() => navigate(`/sales/${saleId}`)}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2"
        >
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى البيع {sale.order_number}
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Boxes className="w-7 h-7 text-app-accent" />
          تحديد محتوى: {line.description}
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          بيعت بسعر <span className="font-mono font-bold">{formatNumber(soldPrice)}</span> د.ل — الأسعار هنا مرجعية فقط ولا تظهر للعميل.
        </p>
      </div>

      {error && <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">{error}</div>}

      {(!isDefined || editing) ? (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-app-separator px-4 py-3 bg-app-bg-secondary">
            <h2 className="text-sm font-bold text-app-label-primary">أصناف الحزمة — عدّل حسب الحاجة</h2>
          </div>
          <div className="divide-y divide-app-separator">
            {rows.map((row) => {
              const size = row.l && row.w && row.h ? { length_m: m(row.l) ?? 0, width_m: m(row.w) ?? 0, height_m: m(row.h) ?? 0 } : undefined;
              const price = row.item ? suggestedPrice(row.item, num(row.qty), size) : null;
              return (
                <div key={row.key} className="p-3 space-y-2">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-[14rem]">
                      <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الصنف</label>
                      <AsyncSearchableSelect<InventoryItem>
                        value={row.item}
                        onChange={(item) => setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, item } : r)))}
                        queryKey={["bundleComponentItems"]}
                        fetcher={async ({ search, page }) => {
                          const res = await inventoryApi.getItems({ search: search || undefined, page, per_page: 20 });
                          return { data: res.data.data, hasMore: res.data.current_page < res.data.last_page };
                        }}
                        getOptionId={(i) => i.id}
                        getOptionLabel={(i) => `${i.name} (${i.code})`}
                        placeholder="ابحث عن الصنف…"
                        size="sm"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">الكمية</label>
                      <input
                        type="number" min="0.01" step="any"
                        value={row.qty}
                        onChange={(e) => setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, qty: e.target.value } : r)))}
                        className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center"
                      />
                    </div>
                    {(["l", "w", "h"] as const).map((dim) => (
                      <div key={dim} className="w-20">
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          {dim === "l" ? "طول سم" : dim === "w" ? "عرض سم" : "ارتفاع سم"}
                        </label>
                        <input
                          type="number" min="0" step="0.1"
                          value={row[dim]}
                          onChange={(e) => setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, [dim]: e.target.value } : r)))}
                          className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono text-center"
                          dir="ltr"
                        />
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRows((prev) => [...prev, { ...row, key: crypto.randomUUID() }])}
                        title="تكرار بمقاس مختلف"
                        className="rounded-lg p-1.5 text-app-label-tertiary hover:bg-app-fill-f1 hover:text-app-accent"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                          className="rounded-lg p-1.5 text-app-label-tertiary hover:bg-app-status-danger/10 hover:text-app-status-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {price !== null && (
                    <p className="text-[11px] text-app-label-tertiary">السعر المرجعي: <span className="font-mono">{formatNumber(price)}</span> د.ل</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-app-separator bg-app-bg-secondary">
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:opacity-80"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة صنف
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-app-label-secondary">
                <Calculator className="w-3.5 h-3.5" />
                مجموع مرجعي <span className="font-mono font-bold">{formatNumber(referenceTotal)}</span>
                {" "}(الفرق عن سعر البيع: <span className={`font-mono font-bold ${difference >= 0 ? "text-app-status-positive" : "text-app-status-danger"}`}>{formatNumber(difference)}</span>)
              </span>
              {editing && (
                <button onClick={() => setEditing(false)} className="px-3 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
                  إلغاء
                </button>
              )}
              <button
                onClick={save}
                disabled={!rowsValid || defineBundle.isPending}
                className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {defineBundle.isPending ? "جارٍ الحفظ…" : "حفظ المحتوى"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-app-separator px-4 py-3 bg-app-bg-secondary">
            <h2 className="text-sm font-bold text-app-label-primary">قطع الحزمة وحالة التجهيز</h2>
            {!isLocked && (
              <button onClick={() => setEditing(true)} className="text-xs font-semibold text-app-accent hover:underline">
                تعديل المحتوى
              </button>
            )}
          </div>
          <div className="divide-y divide-app-separator">
            {components.map((c) => {
              const size = formatSizeCm(c.length_m, c.width_m, c.height_m);
              const cuttable = CUTTABLE_TYPES.includes(c.inventory_item?.item_type ?? "");
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  {c.status === "pending" && cuttable && (
                    <input
                      type="checkbox"
                      checked={cutterSelection.has(c.id)}
                      onChange={() => toggleCutterSelection(c.id)}
                      className="h-4 w-4"
                    />
                  )}
                  <Package className="h-4 w-4 text-app-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{c.inventory_item?.name}</div>
                    <div className="text-[10px] font-mono text-app-label-tertiary">
                      {formatNumber(c.quantity)} × {size ?? "—"}
                      {c.notes && ` · ${c.notes}`}
                    </div>
                  </div>
                  <StatusBadge status={c.status} label={COMPONENT_STATUS_LABEL[c.status]} />
                  {c.status === "pending" && (
                    <button
                      onClick={() => setStockDialogComponent(c)}
                      className="flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-bold text-app-label-primary hover:bg-app-fill-f1"
                    >
                      <Package className="h-3.5 w-3.5" /> من المخزون
                    </button>
                  )}
                  {c.status === "ready" && !c.cutter_work_order_line_id && (
                    <button
                      onClick={() => releaseComponent.mutate(c.id, { onSuccess: () => toast.success("تم إلغاء الحجز") })}
                      className="text-[11px] font-semibold text-app-label-tertiary hover:text-app-status-danger"
                    >
                      تراجع
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-app-separator bg-app-bg-secondary">
            <button
              onClick={() => setCutterDialogOpen(true)}
              disabled={cutterSelection.size === 0}
              className="flex items-center gap-1.5 rounded-xl border border-app-accent/40 bg-app-accent/10 px-3 py-1.5 text-xs font-bold text-app-accent hover:bg-app-accent/15 disabled:opacity-40"
            >
              <Scissors className="h-4 w-4" /> إرسال المحدد للمقص ({cutterSelection.size})
            </button>
            <button
              onClick={() =>
                deliverBundle.mutate(
                  { saleId: saleId as string },
                  { onSuccess: () => toast.success("تم تسليم القطع الجاهزة") },
                )
              }
              disabled={!canDeliver || deliverBundle.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              {deliverBundle.isPending ? "جارٍ التسليم…" : `تسليم الجاهز (${readyCount})`}
            </button>
          </div>
        </div>
      )}

      <ComponentStockDialog
        component={stockDialogComponent}
        itemName={stockDialogComponent?.inventory_item?.name}
        onClose={() => setStockDialogComponent(null)}
      />
      <SendToCutterDialog
        open={cutterDialogOpen}
        saleId={saleId as string}
        componentIds={Array.from(cutterSelection)}
        onClose={() => { setCutterDialogOpen(false); setCutterSelection(new Set()); }}
      />
    </div>
  );
};
