import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Boxes, Plus, Trash2, AlertTriangle, Save } from "lucide-react";
import { useProductionBatch, useBatchBlocks, useRegisterBlocks } from "../../hooks/useProduction";
import { useInventoryItems } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import { BlockGroupInput, apiErrorPayload } from "../../api/endpoints/production";
import { StockLot } from "../../api/endpoints/inventory";

interface DraftRow {
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
  const { data: warehouses } = useWarehouses();
  const registerMutation = useRegisterBlocks();

  const [rows, setRows] = useState<DraftRow[]>([newRow()]);
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bunWidth = batch ? Number(batch.bun_width_m) : 0;

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

  const canSubmit =
    Boolean(itemId) &&
    Boolean(warehouseId) &&
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
          setError(apiErrorPayload(err)?.message ?? "Could not register the blocks."),
      },
    );
  };

  if (batchLoading || !batch) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        Loading batch...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/manufacturing/batches")}
            className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Back to batches
          </button>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Boxes className="w-7 h-7 text-app-accent" />
            Operation{" "}
            <span className="font-mono text-app-accent">{batch.operation_number}</span>
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Bun width <span className="font-mono font-bold">{bunWidth} m</span> (machine setting,
            applied to every block) · Density{" "}
            <span className="font-mono">{batch.formula_params?.density_band ?? "—"}</span> ·{" "}
            {batch.formula_params?.cure_time_minutes ?? "—"} min ·  Speed{" "}
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

      {/* Registration form — mirrors the paper production report */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">Register Output</h2>
          <p className="text-xs text-app-label-secondary mt-0.5">
            Enter rows as they appear on the production report. Each block row becomes that many
            individually labelled blocks; scrap rows record volume only.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-app-bg-secondary border-b border-app-separator">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
              Block Product
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            >
              <option value="">Select foam block item…</option>
              {itemData?.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
              Warehouse
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            >
              <option value="">Select warehouse…</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-start text-xs">
          <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
            <tr>
              <th className="px-3 py-2 text-start">Type</th>
              <th className="px-3 py-2 text-start">Length (m)</th>
              <th className="px-3 py-2 text-start">Height (m)</th>
              <th className="px-3 py-2 text-start">Count</th>
              <th className="px-3 py-2 text-start">Pressure</th>
              <th className="px-3 py-2 text-start">Grade</th>
              <th className="px-3 py-2 text-start">Colour</th>
              <th className="px-3 py-2 text-start">Unit Cost</th>
              <th className="px-3 py-2 text-end">Volume (m³)</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-app-separator text-app-label-primary">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-3 py-2">
                  <select
                    value={row.kind}
                    onChange={(e) =>
                      updateRow(row.key, { kind: e.target.value as DraftRow["kind"] })
                    }
                    className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                  >
                    <option value="block">Block</option>
                    <option value="scrap">Scrap</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={row.length_m}
                    onChange={(e) => updateRow(row.key, { length_m: e.target.value })}
                    className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={row.height_m}
                    onChange={(e) => updateRow(row.key, { height_m: e.target.value })}
                    className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    value={row.count}
                    onChange={(e) => updateRow(row.key, { count: e.target.value })}
                    className="w-16 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  {row.kind === "block" ? (
                    <input
                      type="number"
                      min="1"
                      value={row.pressure}
                      onChange={(e) => updateRow(row.key, { pressure: e.target.value })}
                      className="w-16 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                  ) : (
                    <span className="text-app-label-tertiary">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.kind === "block" ? (
                    <select
                      value={row.grade}
                      onChange={(e) =>
                        updateRow(row.key, { grade: e.target.value as DraftRow["grade"] })
                      }
                      className="px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="acceptable_variant">Variant</option>
                      <option value="defective_usable">Defective</option>
                      <option value="reject">Reject</option>
                    </select>
                  ) : (
                    <span className="text-app-label-tertiary">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.kind === "block" ? (
                    <input
                      type="text"
                      value={row.color}
                      onChange={(e) => updateRow(row.key, { color: e.target.value })}
                      className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                    />
                  ) : (
                    <span className="text-app-label-tertiary">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.kind === "block" ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.unit_cost}
                      onChange={(e) => updateRow(row.key, { unit_cost: e.target.value })}
                      className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                  ) : (
                    <span className="text-app-label-tertiary">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-end font-mono text-app-label-secondary">
                  <div className="font-bold text-app-label-primary">
                    {rowTotal(row).toFixed(4)}
                  </div>
                  <div className="text-[10px]">{rowVolume(row).toFixed(4)} each</div>
                </td>
                <td className="px-3 py-2 text-end">
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                      className="p-1.5 rounded-lg text-app-label-tertiary hover:bg-app-fill-f1 hover:text-app-status-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-app-separator bg-app-bg-secondary font-bold text-app-label-primary">
            <tr>
              <td className="px-3 py-3" colSpan={3}>
                Run total
              </td>
              <td className="px-3 py-3 font-mono">{totals.blockCount}</td>
              <td className="px-3 py-3 text-app-label-secondary font-normal" colSpan={4}>
                blocks
                {totals.scrapVolume > 0 && (
                  <span className="ms-2">
                    · scrap{" "}
                    <span className="font-mono">{totals.scrapVolume.toFixed(4)} m³</span>
                  </span>
                )}
              </td>
              <td className="px-3 py-3 text-end font-mono">
                {(totals.blockVolume + totals.scrapVolume).toFixed(4)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="flex items-center justify-between gap-3 border-t border-app-separator px-4 py-3">
          <button
            onClick={() => setRows((prev) => [...prev, newRow()])}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>

          <button
            onClick={submit}
            disabled={!canSubmit || registerMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {registerMutation.isPending
              ? "Registering..."
              : `Register ${totals.blockCount} Block${totals.blockCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>

      {/* Registered blocks */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-label-primary">
            Registered Blocks ({blocks?.length ?? 0})
          </h2>
          <span className="text-xs text-app-label-secondary font-mono">
            Scrap recorded: {Number(batch.scrap_volume_m3).toFixed(4)} m³
          </span>
        </div>

        {blocksLoading ? (
          <div className="flex h-32 items-center justify-center text-xs text-app-label-secondary">
            Loading blocks...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Block Code</th>
                <th className="px-4 py-3 text-start">Seq</th>
                <th className="px-4 py-3 text-start">Pressure</th>
                <th className="px-4 py-3 text-start">Dimensions</th>
                <th className="px-4 py-3 text-start">Volume</th>
                <th className="px-4 py-3 text-start">Grade</th>
                <th className="px-4 py-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {blocks?.map((lot: StockLot) => (
                <tr key={lot.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">
                    {lot.lot_number}
                  </td>
                  <td className="px-4 py-3 font-mono">{lot.sequence_in_batch ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{lot.pressure ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {lot.length_m}m × {lot.width_m}m × {lot.height_m}m
                  </td>
                  <td className="px-4 py-3 font-mono">{lot.volume_m3} m³</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
                      {lot.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-app-label-secondary">{lot.status}</td>
                </tr>
              ))}
              {blocks?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-tertiary">
                    No blocks registered for this operation yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
