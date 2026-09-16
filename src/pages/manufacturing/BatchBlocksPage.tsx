import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Boxes, Plus, AlertTriangle, Save, Beaker, ChevronLeft } from "lucide-react";
import {
  useProductionBatch,
  useBatchBlocks,
  useRegisterBlocks,
  useTransitionBatch,
  useConsumptionReport,
  useRecordConsumption,
} from "../../hooks/useProduction";
import { useInventoryItems } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import {
  BlockGroupInput,
  ConsumptionLineInput,
  apiErrorPayload,
  BLOCK_ENTRY_STATES,
  NEXT_STATUS,
} from "../../api/endpoints/production";
import { InventoryItem } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useChemicalConsumptionColumns } from "../../components/table-columns/chemicalConsumptionColumns";
import { useBatchDraftRowsColumns } from "../../components/table-columns/batchDraftRowsColumns";
import { useRegisteredBlocksColumns } from "../../components/table-columns/registeredBlocksColumns";

const STATUS_ORDER = [
  "planned", "configured", "running", "consumed",
  "curing", "ready_for_grading", "graded", "closed",
] as const;

const STATUS_LABEL: Record<string, string> = {
  planned: "مخطط",
  configured: "تم الإعداد",
  running: "قيد التشغيل",
  consumed: "مستهلك",
  curing: "قيد التصلب",
  ready_for_grading: "جاهز للفرز",
  graded: "تم الفرز",
  closed: "مغلق",
};

export interface DraftRow {
  key: string;
  kind: "block" | "scrap";
  length_m: string;
  height_m: string;
  count: string;
  pressure: string;
  grade: BlockGroupInput["grade"];
  color: string;
  unit_cost: string;
}

const newRow = (kind: DraftRow["kind"] = "block"): DraftRow => ({
  key: Math.random().toString(36).slice(2),
  kind,
  length_m: "",
  height_m: "",
  count: "1",
  pressure: "",
  grade: "standard",
  color: "",
  unit_cost: "0",
});

const num = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const BatchBlocksPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const { data: batch, isLoading: batchLoading } = useProductionBatch(batchId);
  const { data: blocks, isLoading: blocksLoading } = useBatchBlocks(batchId);
  const { data: itemData } = useInventoryItems({ item_type: "foam_block" });
  const { data: chemicalData } = useInventoryItems({ item_type: "raw_material" });
  const { data: scrapItems } = useInventoryItems({ item_type: "byproduct_fill" });
  const { data: warehouses } = useWarehouses();
  const { data: consumption } = useConsumptionReport(batchId);
  const registerMutation = useRegisterBlocks();
  const transitionMutation = useTransitionBatch();
  const consumptionMutation = useRecordConsumption();

  const [chemLines, setChemLines] = useState<Record<string, string>>({});

  const [rows, setRows] = useState<DraftRow[]>([newRow()]);
  const [itemId, setItemId] = useState("");
  const [scrapItemId, setScrapItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bunWidth = batch ? Number(batch.bun_width_m) : 0;
  const acceptsBlocks = batch ? BLOCK_ENTRY_STATES.includes(batch.status) : false;
  const nextStatus = batch ? NEXT_STATUS[batch.status] : null;

  const rowVolume = (row: DraftRow) => bunWidth * num(row.length_m) * num(row.height_m);
  const rowTotal = (row: DraftRow) => rowVolume(row) * num(row.count);

  const totals = useMemo(() => {
    const blockRows = rows.filter((r) => r.kind === "block");
    const scrapRows = rows.filter((r) => r.kind === "scrap");
    return {
      blockCount: blockRows.reduce((sum, r) => sum + num(r.count), 0),
      blockVolume: blockRows.reduce((sum, r) => sum + rowTotal(r), 0),
      scrapVolume: scrapRows.reduce((sum, r) => sum + rowTotal(r), 0),
    };
  }, [rows, bunWidth]);

  const updateRow = (key: string, patch: Partial<DraftRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const hasScrapRow = rows.some((r) => r.kind === "scrap");

  const canSubmit =
    acceptsBlocks &&
    Boolean(itemId) &&
    Boolean(warehouseId) &&
    (!hasScrapRow || Boolean(scrapItemId)) &&
    rows.length > 0 &&
    rows.every(
      (r) =>
        num(r.length_m) > 0 &&
        num(r.height_m) > 0 &&
        num(r.count) > 0 &&
        (r.kind === "scrap" || num(r.pressure) > 0),
    );

  const submit = () => {
    if (!batchId) return;
    setError(null);

    const groups: BlockGroupInput[] = rows.map((r) =>
      r.kind === "scrap"
        ? {
            kind: "scrap",
            count: num(r.count),
            length_m: num(r.length_m),
            height_m: num(r.height_m),
            // Scrap enters stock as a zero-cost byproduct, so it needs a home too.
            inventory_item_id: scrapItemId,
            warehouse_id: warehouseId,
          }
        : {
            kind: "block",
            count: num(r.count),
            length_m: num(r.length_m),
            height_m: num(r.height_m),
            pressure: num(r.pressure),
            inventory_item_id: itemId,
            warehouse_id: warehouseId,
            unit_cost: num(r.unit_cost),
            grade: r.grade,
            ...(r.color ? { color: r.color } : {}),
          },
    );

    registerMutation.mutate(
      { id: batchId, groups },
      {
        onSuccess: () => setRows([newRow()]),
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر تسجيل البلوكات."),
      },
    );
  };

  const advance = () => {
    if (!batchId || !nextStatus) return;
    setError(null);
    transitionMutation.mutate(
      { id: batchId, status: nextStatus },
      {
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر ترقية حالة الدفعة."),
      },
    );
  };

  const submitConsumption = () => {
    if (!batchId) return;
    setError(null);

    const lines: ConsumptionLineInput[] = Object.entries(chemLines)
      .filter(([, v]) => v !== "")
      .map(([id, v]) => ({ chemical_inventory_item_id: id, quantity_consumed: num(v) }));

    if (lines.length === 0) return;

    consumptionMutation.mutate(
      { id: batchId, lines },
      {
        onSuccess: () => setChemLines({}),
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر تسجيل الاستهلاك."),
      },
    );
  };

  // Chemical consumption report — a handful of lines per batch, no search/pagination needed.
  const consumptionColumns = useChemicalConsumptionColumns();
  const consumptionTableData = useMemo(() => consumption?.report.lines ?? [], [consumption]);
  const consumptionTable = useDataTable({
    columns: consumptionColumns,
    data: consumptionTableData,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (l) => l.id,
  });

  // Draft registration rows — a small, user-built list (typically 1-5 rows) edited inline
  // before submit, so no search/pagination/sorting here either.
  const draftColumns = useBatchDraftRowsColumns({
    rowsCount: rows.length,
    rowTotal,
    rowVolume,
    onUpdateRow: updateRow,
    onRemoveRow: removeRow,
  });
  const draftTable = useDataTable({
    columns: draftColumns,
    data: rows,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (r) => r.key,
  });

  // Registered blocks — the page's main per-batch list; can grow large, so it gets
  // sorting/search/pagination like a top-level list would.
  const blocksColumns = useRegisteredBlocksColumns();
  const blocksTableData = useMemo(() => blocks ?? [], [blocks]);
  const blocksTable = useDataTable({
    columns: blocksColumns,
    data: blocksTableData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (lot) => lot.id,
  });

  if (batchLoading || !batch) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جاري تحميل الدفعة…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/manufacturing/batches")}
            className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" /> العودة إلى الدفعات
          </button>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Boxes className="w-7 h-7 text-app-accent" />
            العملية{" "}
            <span className="font-mono text-app-accent">{batch.operation_number}</span>
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            عرض الكتلة <span className="font-mono font-bold">{bunWidth} م</span> (إعداد الماكينة،
            يُطبق على كل بلوك) · نطاق الكثافة{" "}
            <span className="font-mono">{batch.formula_params?.density_band ?? "—"}</span> ·{" "}
            {batch.formula_params?.cure_time_minutes ?? "—"} دقيقة · سرعة السير الناقل{" "}
            {batch.formula_params?.conveyor_speed ?? "—"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_ORDER.map((s) => {
            const reached = STATUS_ORDER.indexOf(s) <= STATUS_ORDER.indexOf(batch.status);
            const current = s === batch.status;
            return (
              <span
                key={s}
                className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                  current
                    ? "bg-app-accent text-white"
                    : reached
                      ? "bg-app-accent-subtle text-app-accent"
                      : "bg-app-fill-f1 text-app-label-tertiary"
                }`}
              >
                {STATUS_LABEL[s]}
              </span>
            );
          })}

          {nextStatus && (
            <button
              onClick={advance}
              disabled={transitionMutation.isPending}
              className="ms-auto flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              {transitionMutation.isPending ? "جاري الترقية…" : `ترقية إلى ${STATUS_LABEL[nextStatus]}`}
            </button>
          )}
        </div>
      </div>

      {/* Chemical consumption */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-app-label-primary">استهلاك المواد الكيميائية</h2>
            <p className="text-xs text-app-label-secondary mt-0.5">
              يُسحب من مخزون الخزان بمتوسط تكلفة الخزان الحالي، بلقطة لحظية عند هذه العملية.
            </p>
          </div>
          {consumption && (
            <span className="text-xs font-mono text-app-label-secondary">
              تكلفة المواد: {formatNumber(consumption.material_cost)} LYD
            </span>
          )}
        </div>

        {consumption ? (
          <DataTable table={consumptionTable} className="rounded-none border-0 shadow-none bg-transparent">
            <DataTable.Content emptyMessage="لا توجد بنود استهلاك." emptyIcon={Beaker} />
          </DataTable>
        ) : (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chemicalData?.data.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <label className="flex-1 text-xs text-app-label-primary">
                    {c.name} <span className="text-app-label-tertiary font-mono">({c.sku})</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={chemLines[c.id] ?? ""}
                    onChange={(e) => setChemLines({ ...chemLines, [c.id]: e.target.value })}
                    className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </div>
              ))}
              {chemicalData?.data.length === 0 && (
                <p className="text-xs text-app-label-tertiary">لا توجد أصناف مواد خام معرّفة بعد.</p>
              )}
            </div>
            <button
              onClick={submitConsumption}
              disabled={consumptionMutation.isPending || Object.values(chemLines).every((v) => v === "")}
              className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              <Beaker className="w-4 h-4" />
              {consumptionMutation.isPending ? "جاري التسجيل…" : "تسجيل الاستهلاك"}
            </button>
          </div>
        )}
      </div>

      {/* Registration form — mirrors the paper production report */}
      <div className={`rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm ${acceptsBlocks ? "" : "opacity-60"}`}>
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">تسجيل الإنتاج</h2>
          <p className="text-xs text-app-label-secondary mt-0.5">
            أدخل الصفوف كما تظهر في تقرير الإنتاج. كل صف بلوك يتحول إلى ذلك العدد من البلوكات
            الموسومة فردياً؛ صفوف الهدر تسجل الحجم فقط.
          </p>
          {!acceptsBlocks && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-app-status-yellow">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              يتم إدخال البلوكات بعد الفرز. رقّي الدفعة إلى{" "}
              <strong>جاهز للفرز</strong> أولاً.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-app-bg-secondary border-b border-app-separator">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
              صنف البلوك
            </label>
            <SearchableSelect<InventoryItem>
              options={itemData?.data ?? []}
              value={itemData?.data.find((i) => i.id === itemId) ?? null}
              onChange={(item) => setItemId(item ? item.id : "")}
              getOptionId={(i) => i.id}
              getOptionLabel={(i) => i.name}
              getOptionSubLabel={(i) => i.sku}
              getOptionSearchText={(i) => `${i.name} ${i.sku}`}
              placeholder="اختر صنف بلوك الإسفنج…"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
              صنف الهدر
            </label>
            <SearchableSelect<InventoryItem>
              options={scrapItems?.data ?? []}
              value={
                scrapItems?.data.find((i) => i.id === scrapItemId) ?? null
              }
              onChange={(item) => setScrapItemId(item ? item.id : "")}
              getOptionId={(i) => i.id}
              getOptionLabel={(i) => i.name}
              getOptionSubLabel={(i) => i.sku}
              getOptionSearchText={(i) => `${i.name} ${i.sku}`}
              placeholder={
                hasScrapRow ? "اختر صنف الهدر…" : "مطلوب فقط لصفوف الهدر"
              }
            />
            <p className="text-[10px] text-app-label-tertiary mt-1">
              الهدر يدخل المخزون بتكلفة صفرية
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
              المخزن
            </label>
            <SearchableSelect<{ id: string; name: string }>
              options={warehouses ?? []}
              value={warehouses?.find((w) => w.id === warehouseId) ?? null}
              onChange={(w) => setWarehouseId(w ? w.id : "")}
              getOptionId={(w) => w.id}
              getOptionLabel={(w) => w.name}
              placeholder="اختر المخزن…"
            />
          </div>
        </div>

        <DataTable table={draftTable} className="rounded-none border-0 shadow-none bg-transparent">
          <DataTable.Content />
        </DataTable>

        {/* DataTable.Content has no tfoot slot, so the running totals render as a matching summary bar. */}
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-app-separator bg-app-bg-secondary px-3 py-3 text-xs font-bold text-app-label-primary">
          <span>إجمالي التشغيلة</span>
          <span className="font-mono">{totals.blockCount}</span>
          <span className="text-app-label-secondary font-normal">
            بلوك
            {totals.scrapVolume > 0 && (
              <span className="ms-2">
                · هدر{" "}
                <span className="font-mono">{totals.scrapVolume.toFixed(4)} م³</span>
              </span>
            )}
          </span>
          <span className="ms-auto font-mono">
            {(totals.blockVolume + totals.scrapVolume).toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-app-separator px-4 py-3">
          <button
            onClick={() => setRows((prev) => [...prev, newRow()])}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة صف
          </button>

          <button
            onClick={submit}
            disabled={!canSubmit || registerMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {registerMutation.isPending
              ? "جاري التسجيل…"
              : `تسجيل ${totals.blockCount} بلوك`}
          </button>
        </div>
      </div>

      {/* Registered blocks */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-label-primary">
            البلوكات المسجلة ({blocks?.length ?? 0})
          </h2>
          <span className="text-xs text-app-label-secondary font-mono">
            الهدر المسجل: {Number(batch.scrap_volume_m3).toFixed(4)} م³
          </span>
        </div>

        <DataTable table={blocksTable} className="rounded-none border-0 shadow-none bg-transparent">
          <DataTable.Header>
            <DataTable.Toolbar>
              <DataTable.SearchInput placeholder="بحث في البلوكات..." />
            </DataTable.Toolbar>
          </DataTable.Header>
          <DataTable.Content
            isLoading={blocksLoading}
            emptyMessage="لا توجد بلوكات مسجلة لهذه العملية بعد."
            emptyIcon={Boxes}
          />
          <DataTable.Pagination />
        </DataTable>
      </div>
    </div>
  );
};
