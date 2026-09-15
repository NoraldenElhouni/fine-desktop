import React, { useState } from "react";
import { useStockLots, useInventoryValuation, useProcessCutRemnant } from "../../hooks/useInventory";
import { useItemCategories } from "../../hooks/useCategories";
import { StockLot } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";
import { Layers, Box, CheckCircle, DollarSign, RefreshCw, Scissors, AlertCircle, Tags } from "lucide-react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

export const StockLedgerPage: React.FC = () => {
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedLotForCut, setSelectedLotForCut] = useState<StockLot | null>(null);

  const [remnantAction, setRemnantAction] = useState<"restock_remnant" | "convert_to_byproduct">("restock_remnant");
  const [lengthM, setLengthM] = useState<number>(1.0);
  const [widthM, setWidthM] = useState<number>(2.0);
  const [heightM, setHeightM] = useState<number>(1.0);
  const [byproductKg, setByproductKg] = useState<number>(0);

  const { data: lotData, isLoading, refetch } = useStockLots({
    grade: gradeFilter || undefined,
    status: statusFilter || undefined,
    category_id: categoryFilter || undefined,
  });

  const { data: categories } = useItemCategories();
  const { data: valuation } = useInventoryValuation();
  const processCutMutation = useProcessCutRemnant();

  const handleCutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForCut) return;

    processCutMutation.mutate(
      {
        id: selectedLotForCut.id,
        data: {
          remnant_action: remnantAction,
          remnant_dimensions:
            remnantAction === "restock_remnant"
              ? { length_m: lengthM, width_m: widthM, height_m: heightM }
              : undefined,
          byproduct_weight_kg: byproductKg > 0 ? byproductKg : undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedLotForCut(null);
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Layers className="w-7 h-7 text-app-accent" />
            Serialized Stock Ledger & Lots
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Serialized foam blocks, Dual UOM, dynamic category attributes, volume ($m^3$), grade, and status audit.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">Unit Stock Valuation</div>
            <div className="text-xl font-bold text-app-label-primary">
              {formatNumber(valuation?.total_valuation)} {valuation?.currency || "LYD"}
            </div>
          </div>
        </div>

        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">Available Serialized Lots</div>
            <div className="text-xl font-bold text-app-label-primary">
              {valuation?.total_lots || 0} Lots
            </div>
          </div>
        </div>

        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">Chemical Bulk Tanks</div>
            <div className="text-xl font-bold text-app-label-primary">
              {valuation?.total_tanks || 0} Tanks
            </div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-4 bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
        <div className="min-w-[12rem]">
          <SearchableSelect<{ id: string; name: string }>
            options={categories ?? []}
            value={
              categories?.find((c) => c.id === categoryFilter) ?? null
            }
            onChange={(c) => setCategoryFilter(c ? c.id : "")}
            getOptionId={(c) => c.id}
            getOptionLabel={(c) => c.name}
            placeholder="All Categories"
            size="sm"
          />
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
        >
          <option value="">All Block Grades</option>
          <option value="standard">Standard Grade</option>
          <option value="acceptable_variant">Acceptable Variant</option>
          <option value="defective_usable">Defective Usable</option>
          <option value="reject">Reject</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="consumed">Consumed</option>
          <option value="quarantined">Quarantined</option>
        </select>
      </div>

      {/* Stock Lots Table */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">Loading stock lots...</div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Lot Number</th>
                <th className="px-4 py-3 text-start">Item / SKU</th>
                <th className="px-4 py-3 text-start">Container & Measure Quantity</th>
                <th className="px-4 py-3 text-start">Dimensions / Attributes</th>
                <th className="px-4 py-3 text-start">Unit Cost</th>
                <th className="px-4 py-3 text-start">Grade</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Cutter Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {lotData?.data.map((lot: StockLot) => (
                <tr key={lot.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{lot.lot_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-app-label-primary">{lot.inventory_item?.name || "Foam Block"}</div>
                    <div className="text-xs text-app-label-tertiary font-mono">{lot.inventory_item?.sku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-app-label-primary">
                      {lot.container_quantity || 1} {lot.inventory_item?.primary_uom || "unit"}
                    </div>
                    <div className="text-xs text-indigo-600 font-mono">
                      {lot.volume_m3 ? `${lot.volume_m3} m³` : `${lot.quantity} ${lot.inventory_item?.secondary_uom || lot.inventory_item?.unit_of_measure || ""}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-app-label-secondary">
                    {lot.length_m ? (
                      <div>{`${lot.length_m}m × ${lot.width_m}m × ${lot.height_m}m`}</div>
                    ) : null}
                    {lot.attribute_values && Object.keys(lot.attribute_values).length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(lot.attribute_values).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 text-slate-700 font-sans">
                            {k}: <strong>{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-primary">
                    {formatNumber(lot.unit_cost)} LYD
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                      {lot.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lot.status === "available"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-app-fill-f1 text-app-label-secondary"
                      }`}
                    >
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {lot.status === "available" && lot.length_m ? (
                      <button
                        onClick={() => {
                          setSelectedLotForCut(lot);
                          setLengthM(lot.length_m ? Number((lot.length_m / 2).toFixed(2)) : 1.0);
                          setWidthM(lot.width_m || 2.0);
                          setHeightM(lot.height_m || 1.0);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
                      >
                        <Scissors className="w-3.5 h-3.5" /> Cut Remnant
                      </button>
                    ) : (
                      <span className="text-xs text-app-label-tertiary">--</span>
                    )}
                  </td>
                </tr>
              ))}
              {lotData?.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-app-label-tertiary">
                    No serialized stock lots found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Option C: Cutter Completion Modal */}
      <Dialog open={Boolean(selectedLotForCut)} onOpenChange={(next) => !next && setSelectedLotForCut(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>Cut Remnant Decision</DialogTitle>
                {selectedLotForCut && (
                  <DialogDescription>
                    Parent Lot: <span className="font-mono font-bold">{selectedLotForCut.lot_number}</span>
                  </DialogDescription>
                )}
              </div>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            {selectedLotForCut && (
            <form id="cut-remnant-form" onSubmit={handleCutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-2">
                  Remnant Disposition Action
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRemnantAction("restock_remnant")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      remnantAction === "restock_remnant"
                        ? "border-app-accent bg-app-accent-subtle text-app-accent shadow-sm"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                    }`}
                  >
                    Restock Remnant Block
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemnantAction("convert_to_byproduct")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      remnantAction === "convert_to_byproduct"
                        ? "border-app-accent bg-app-accent-subtle text-app-accent shadow-sm"
                        : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                    }`}
                  >
                    Convert to Byproduct Fill
                  </button>
                </div>
              </div>

              {remnantAction === "restock_remnant" && (
                <div className="space-y-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
                  <div className="text-xs font-bold text-app-label-primary">
                    Operator Input: Remnant Block Dimensions ($L \times W \times H$)
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-app-label-secondary mb-1">Length (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={lengthM}
                        onChange={(e) => setLengthM(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-app-label-secondary mb-1">Width (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={widthM}
                        onChange={(e) => setWidthM(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-app-label-secondary mb-1">Height (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={heightM}
                        onChange={(e) => setHeightM(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-app-label-tertiary">
                    Calculated Remnant Volume: <span className="font-bold text-app-accent font-mono">{(lengthM * widthM * heightM).toFixed(4)} m³</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  Trim Shavings / Byproduct Weight (kg, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={byproductKg}
                  onChange={(e) => setByproductKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-xs text-sky-800 flex items-start gap-2 border border-sky-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Completing this action marks lot <span className="font-mono font-bold">{selectedLotForCut.lot_number}</span> as consumed.
                </span>
              </div>

            </form>
            )}
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedLotForCut(null)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cut-remnant-form"
              disabled={processCutMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {processCutMutation.isPending ? "Processing Cut..." : "Confirm Cut Disposition"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
