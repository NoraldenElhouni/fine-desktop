import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Scissors, Plus, AlertTriangle, ChevronLeft, Ruler, Package, Scale, CheckCircle2,
} from "lucide-react";
import {
  useCutterOrder, useTransitionCutterOrder, useAddCutterLine, useAssignTemplate,
  useAvailableBlocks, useSelectBlock, useRecordWeighIn,
} from "../../hooks/useCutter";
import { useInventoryItems } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import {
  CUTTER_STATUS_ORDER, CUTTER_STATUS_LABEL, CUTTER_NEXT_STATUS, BLOCK_SELECTION_STATES,
  CutterWorkOrderLine,
} from "../../api/endpoints/cutter";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { InventoryItem } from "../../api/endpoints/inventory";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const CutterWorkOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useCutterOrder(orderId);
  const { data: pieceItems } = useInventoryItems({ item_type: "cut_template_piece" });
  const { data: fillItems } = useInventoryItems({ item_type: "byproduct_fill" });
  const { data: warehouses } = useWarehouses();

  const transitionMutation = useTransitionCutterOrder();
  const addLineMutation = useAddCutterLine();
  const templateMutation = useAssignTemplate(orderId);
  const selectBlockMutation = useSelectBlock(orderId);
  const weighInMutation = useRecordWeighIn(orderId);

  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState("");
  const [qty, setQty] = useState("1");
  const [pieceItemId, setPieceItemId] = useState("");
  const [tpl, setTpl] = useState<Record<string, { l: string; w: string; h: string }>>({});
  const [pickingLineId, setPickingLineId] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [fillItemId, setFillItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const { data: blocks, isLoading: blocksLoading } = useAvailableBlocks(
    pickingLineId ?? undefined,
    Boolean(pickingLineId),
  );

  const nextStatus = order ? CUTTER_NEXT_STATUS[order.status] : null;
  const canPickBlocks = order ? BLOCK_SELECTION_STATES.includes(order.status) : false;
  const atWeighIn = order?.status === "awaiting_byproduct_weigh_in";
  const hasWeighIn = (order?.byproduct_yields?.length ?? 0) > 0;

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const advance = () => {
    if (!orderId || !nextStatus) return;
    setError(null);
    transitionMutation.mutate(
      { id: orderId, status: nextStatus },
      { onError: (e) => fail(e, "Could not advance the order.") },
    );
  };

  const addLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setError(null);
    addLineMutation.mutate(
      {
        id: orderId,
        data: {
          requested_spec: spec,
          quantity: num(qty) || 1,
          output_inventory_item_id: pieceItemId || undefined,
        },
      },
      {
        onSuccess: () => { setSpec(""); setQty("1"); },
        onError: (e) => fail(e, "Could not add the line."),
      },
    );
  };

  const saveTemplate = (line: CutterWorkOrderLine) => {
    const t = tpl[line.id];
    if (!t) return;
    setError(null);
    templateMutation.mutate(
      {
        lineId: line.id,
        data: {
          template_length_m: num(t.l),
          template_width_m: num(t.w),
          template_height_m: num(t.h),
        },
      },
      { onError: (e) => fail(e, "Could not assign the template.") },
    );
  };

  const pickBlock = (lineId: string, stockLotId: string) => {
    setError(null);
    selectBlockMutation.mutate(
      { lineId, stockLotId },
      {
        onSuccess: () => setPickingLineId(null),
        onError: (e) => fail(e, "Could not select that block."),
      },
    );
  };

  const submitWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    weighInMutation.mutate(
      {
        weight_kg: num(weight),
        byproduct_inventory_item_id: num(weight) > 0 ? fillItemId || undefined : undefined,
        warehouse_id: num(weight) > 0 ? warehouseId || undefined : undefined,
      },
      { onError: (e) => fail(e, "Could not record the weigh-in.") },
    );
  };

  if (isLoading || !order) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        Loading work order...
      </div>
    );
  }

  const templateVolume = (t?: { l: string; w: string; h: string }) =>
    t ? num(t.l) * num(t.w) * num(t.h) : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <button
          onClick={() => navigate("/cutter/orders")}
          className="flex items-center gap-1 text-xs text-app-label-secondary hover:text-app-accent mb-2 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Back to work orders
        </button>
        <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
          <Scissors className="w-7 h-7 text-app-accent" />
          <span className="font-mono text-app-accent">{order.order_number}</span>
        </h1>
        <p className="text-xs text-app-label-secondary mt-1">
          {order.client_id ? "Client order" : "Internal order — no credit check"} · Material held:{" "}
          <span className="font-mono">{formatNumber(order.wip_cost)} LYD</span>
        </p>
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
          {CUTTER_STATUS_ORDER.map((s) => {
            const reached = CUTTER_STATUS_ORDER.indexOf(s) <= CUTTER_STATUS_ORDER.indexOf(order.status);
            const current = s === order.status;
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
                {CUTTER_STATUS_LABEL[s]}
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
              {transitionMutation.isPending ? "Advancing..." : `Advance to ${CUTTER_STATUS_LABEL[nextStatus]}`}
            </button>
          )}
        </div>

        {atWeighIn && !hasWeighIn && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-app-status-yellow">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            This order cannot pass quality check until the offcuts are weighed. Enter <strong>0</strong>{" "}
            if there was nothing to salvage — that is a valid answer, but it has to be recorded.
          </p>
        )}
      </div>

      {/* Weigh-in — surfaced above the lines while it is the blocking step */}
      {atWeighIn && (
        <div className="rounded-2xl border border-app-status-yellow/40 bg-app-status-yellow/5 shadow-sm">
          <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-app-status-yellow" />
            <h2 className="text-sm font-bold text-app-label-primary">Byproduct Weigh-In</h2>
          </div>

          {hasWeighIn ? (
            <div className="p-4 space-y-2">
              {order.byproduct_yields?.map((y) => (
                <div key={y.id} className="flex items-center gap-3 text-xs text-app-label-primary">
                  <CheckCircle2 className="w-4 h-4 text-app-status-positive" />
                  <span className="font-mono font-bold">{Number(y.weight_kg).toFixed(2)} kg</span>
                  <span className="text-app-label-secondary">
                    carrying {formatNumber(y.yield_cost)} LYD
                    {Number(y.weight_kg) === 0 && " — nothing salvaged, value stays with the pieces"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={submitWeighIn} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    Offcut Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    Byproduct Item
                  </label>
                  <SearchableSelect<InventoryItem>
                    options={fillItems?.data ?? []}
                    value={
                      fillItems?.data.find((i) => i.id === fillItemId) ?? null
                    }
                    onChange={(i) => setFillItemId(i ? i.id : "")}
                    getOptionId={(i) => i.id}
                    getOptionLabel={(i) => i.name}
                    getOptionSubLabel={(i) => i.sku}
                    getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                    placeholder={
                      num(weight) === 0 ? "Not needed for 0 kg" : "Select fill item…"
                    }
                    disabled={num(weight) === 0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    Warehouse
                  </label>
                  <SearchableSelect<{ id: string; name: string }>
                    options={warehouses ?? []}
                    value={
                      warehouses?.find((w) => w.id === warehouseId) ?? null
                    }
                    onChange={(w) => setWarehouseId(w ? w.id : "")}
                    getOptionId={(w) => w.id}
                    getOptionLabel={(w) => w.name}
                    placeholder={
                      num(weight) === 0 ? "Not needed for 0 kg" : "Select warehouse…"
                    }
                    disabled={num(weight) === 0}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={weighInMutation.isPending || weight === ""}
                className="flex items-center gap-1.5 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                <Scale className="w-4 h-4" />
                {weighInMutation.isPending ? "Recording..." : "Record Weigh-In"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lines */}
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">Lines</h2>
          <p className="text-xs text-app-label-secondary mt-0.5">
            The requested shape is what the client asked for. The template is the box actually cut —
            it drives costing, stock dimensions and billing.
          </p>
        </div>

        <div className="divide-y divide-app-separator">
          {order.lines?.map((line) => {
            const t = tpl[line.id] ?? {
              l: line.template_length_m ? String(line.template_length_m) : "",
              w: line.template_width_m ? String(line.template_width_m) : "",
              h: line.template_height_m ? String(line.template_height_m) : "",
            };
            const liveVolume = templateVolume(t);
            const consumed = line.consumptions ?? [];

            return (
              <div key={line.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-app-label-primary">
                      {line.requested_spec}
                    </div>
                    <div className="text-xs text-app-label-tertiary">
                      Quantity {line.quantity}
                      {line.output_item && ` · outputs ${line.output_item.sku}`}
                    </div>
                  </div>
                  {line.template_volume_m3 ? (
                    <span className="px-2 py-1 rounded-full text-xs font-mono bg-app-accent-subtle text-app-accent shrink-0">
                      {Number(line.template_volume_m3).toFixed(4)} m³ each
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-app-status-yellow/15 text-app-status-yellow shrink-0">
                      No template yet
                    </span>
                  )}
                </div>

                {/* Template assignment */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-app-bg-secondary rounded-xl p-3">
                  {(["l", "w", "h"] as const).map((k) => (
                    <div key={k}>
                      <label className="block text-[10px] uppercase text-app-label-secondary mb-1">
                        {k === "l" ? "Length" : k === "w" ? "Width" : "Height"} (m)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={t[k]}
                        onChange={(e) => setTpl({ ...tpl, [line.id]: { ...t, [k]: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="text-xs">
                    <div className="text-[10px] uppercase text-app-label-secondary mb-1">Volume</div>
                    <div className="font-mono font-bold text-app-label-primary py-1.5">
                      {liveVolume.toFixed(4)} m³
                    </div>
                  </div>
                  <button
                    onClick={() => saveTemplate(line)}
                    disabled={templateMutation.isPending || liveVolume <= 0}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Set Template
                  </button>
                </div>

                {/* Consumed blocks */}
                {consumed.length > 0 && (
                  <div className="space-y-1">
                    {consumed.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-2 text-xs text-app-label-secondary"
                      >
                        <Package className="w-3.5 h-3.5 text-app-accent" />
                        <span className="font-mono font-bold text-app-label-primary">
                          {c.stock_lot?.lot_number}
                        </span>
                        <span>
                          {Number(c.block_volume_m3).toFixed(4)} m³ block · used{" "}
                          {Number(c.volume_consumed_m3).toFixed(4)} m³ ({c.consumption_type})
                        </span>
                        <span className="font-mono">
                          template {formatNumber(c.consumed_cost)} · offcut{" "}
                          {formatNumber(c.remainder_cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {canPickBlocks && line.template_volume_m3 && (
                  <button
                    onClick={() => setPickingLineId(pickingLineId === line.id ? null : line.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    {pickingLineId === line.id ? "Hide blocks" : "Choose a block"}
                  </button>
                )}

                {/* Block selection — filtered candidates, the manager decides */}
                {pickingLineId === line.id && (
                  <div className="rounded-xl border border-app-accent/40 bg-app-accent-tint p-3">
                    <p className="text-xs text-app-label-secondary mb-2">
                      Blocks with at least{" "}
                      <span className="font-mono font-bold">
                        {(Number(line.template_volume_m3) * line.quantity).toFixed(4)} m³
                      </span>
                      , smallest first. The system filters — you choose.
                    </p>

                    {blocksLoading ? (
                      <div className="text-xs text-app-label-secondary py-4 text-center">
                        Loading blocks...
                      </div>
                    ) : (blocks?.length ?? 0) === 0 ? (
                      <div className="text-xs text-app-label-tertiary py-4 text-center">
                        No available block is large enough.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {blocks?.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => pickBlock(line.id, b.id)}
                            disabled={selectBlockMutation.isPending}
                            className="text-start rounded-xl border border-app-separator bg-app-bg-primary p-3 hover:border-app-accent hover:shadow-sm transition-all disabled:opacity-50"
                          >
                            <div className="font-mono font-bold text-app-accent text-xs">
                              {b.lot_number}
                            </div>
                            <div className="text-[11px] text-app-label-secondary mt-1 font-mono">
                              {b.length_m}×{b.width_m}×{b.height_m} m
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-bold text-app-label-primary font-mono">
                                {Number(b.volume_m3).toFixed(4)} m³
                              </span>
                              <span className="text-[11px] text-app-label-secondary font-mono">
                                {formatNumber(b.unit_cost)}
                              </span>
                            </div>
                            {b.grade && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded bg-app-fill-f1 text-app-label-secondary">
                                {b.grade}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {(order.lines?.length ?? 0) === 0 && (
            <div className="px-4 py-8 text-center text-xs text-app-label-tertiary">
              No lines yet. Add what the client asked for below.
            </div>
          )}
        </div>

        {/* Request entry */}
        {order.status === "requested" && (
          <form onSubmit={addLine} className="border-t border-app-separator p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                Requested Shape
              </label>
              <input
                type="text"
                required
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Round pillow insert, radius 8cm"
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect<InventoryItem>
                  options={pieceItems?.data ?? []}
                  value={
                    pieceItems?.data.find((i) => i.id === pieceItemId) ?? null
                  }
                  onChange={(i) => setPieceItemId(i ? i.id : "")}
                  getOptionId={(i) => i.id}
                  getOptionLabel={(i) => i.sku}
                  getOptionSubLabel={(i) => i.name}
                  getOptionSearchText={(i) => `${i.sku} ${i.name}`}
                  placeholder="Output item…"
                />
              </div>
              <button
                type="submit"
                disabled={addLineMutation.isPending}
                className="rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
