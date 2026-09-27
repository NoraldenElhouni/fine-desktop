import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, AlertCircle, DollarSign, History, Layers, Scissors } from "lucide-react";
import {
  useInventoryItem,
  useStockLots,
  useProcessCutRemnant,
  useWarehouseLedger,
} from "../../hooks/useInventory";
import { StockLot } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useStockLedgerColumns } from "../../components/table-columns/stockLedgerColumns";
import { useInventoryMovementColumns } from "../../components/table-columns/inventoryMovementColumns";

const WarehouseItemDetailPage: React.FC = () => {
  const { warehouseId, itemId } = useParams<{ warehouseId: string; itemId: string }>();
  const navigate = useNavigate();

  const [selectedLotForCut, setSelectedLotForCut] = useState<StockLot | null>(null);
  const [remnantAction, setRemnantAction] = useState<"restock_remnant" | "convert_to_byproduct">("restock_remnant");
  const [lengthM, setLengthM] = useState<number>(1.0);
  const [widthM, setWidthM] = useState<number>(2.0);
  const [heightM, setHeightM] = useState<number>(1.0);
  const [byproductKg, setByproductKg] = useState<number>(0);

  const { data: item } = useInventoryItem(itemId);
  const { data: lotData, isLoading: isLoadingLots } = useStockLots({
    warehouse_id: warehouseId,
    inventory_item_id: itemId,
  });
  const { data: ledger, isLoading: isLoadingLedger } = useWarehouseLedger(warehouseId, {
    sku: item?.code,
    per_page: 50,
  });
  const processCutMutation = useProcessCutRemnant();

  const lots = useMemo(() => lotData?.data ?? [], [lotData]);
  const availableLots = useMemo(() => lots.filter((l) => l.status === "available"), [lots]);
  const totalQuantity = useMemo(
    () => availableLots.reduce((sum, l) => sum + Number(l.quantity), 0),
    [availableLots],
  );
  const totalValue = useMemo(
    () => availableLots.reduce((sum, l) => sum + Number(l.quantity) * Number(l.unit_cost), 0),
    [availableLots],
  );
  const avgUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  const openCutModal = (lot: StockLot) => {
    setSelectedLotForCut(lot);
    setLengthM(lot.length_m ? Number((lot.length_m / 2).toFixed(2)) : 1.0);
    setWidthM(lot.width_m || 2.0);
    setHeightM(lot.height_m || 1.0);
  };

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
      { onSuccess: () => setSelectedLotForCut(null) },
    );
  };

  const lotColumns = useStockLedgerColumns({ onOpenCutModal: openCutModal });
  const lotsTable = useDataTable({
    columns: lotColumns,
    data: lots,
    enableSorting: true,
    pageSize: 10,
    getRowId: (lot) => lot.id,
  });

  const movementColumns = useInventoryMovementColumns();
  const movementRows = useMemo(() => ledger?.data ?? [], [ledger]);
  const historyTable = useDataTable({
    columns: movementColumns,
    data: movementRows,
    enableSorting: true,
    pageSize: 10,
    getRowId: (m) => m.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/inventory/ledger/${warehouseId}`)}
          className="rounded-xl border border-app-separator bg-app-bg-secondary p-2 hover:bg-app-fill-f1 transition-colors"
          aria-label="رجوع"
        >
          <ArrowRight className="w-4 h-4 text-app-label-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-app-label-primary">{item?.name ?? "الصنف"}</h1>
          <p className="text-xs text-app-label-tertiary font-mono mt-0.5">{item?.code}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">الكمية المتاحة</div>
            <div className="text-xl font-bold text-app-label-primary">
              {formatNumber(totalQuantity)} {item?.unit_of_measure}
            </div>
          </div>
        </div>

        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">متوسط سعر الوحدة</div>
            <div className="text-xl font-bold text-app-label-primary">{formatNumber(avgUnitCost)} LYD</div>
          </div>
        </div>

        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">القيمة الإجمالية</div>
            <div className="text-xl font-bold text-app-label-primary">{formatNumber(totalValue)} LYD</div>
          </div>
        </div>
      </div>

      {/* Lots */}
      <div>
        <h2 className="text-sm font-bold text-app-label-primary mb-2">الدفعات في هذا المخزن</h2>
        <DataTable table={lotsTable}>
          <DataTable.Content
            isLoading={isLoadingLots}
            emptyMessage="لا توجد دفعات لهذا الصنف في هذا المخزن."
            emptyIcon={Layers}
          />
          <DataTable.Pagination />
        </DataTable>
      </div>

      {/* Price / movement history */}
      <div>
        <h2 className="text-sm font-bold text-app-label-primary mb-2">سجل الحركة والأسعار</h2>
        <DataTable table={historyTable}>
          <DataTable.Content
            isLoading={isLoadingLedger}
            emptyMessage="لا توجد حركات مسجلة لهذا الصنف في هذا المخزن."
            emptyIcon={History}
          />
          <DataTable.Pagination />
        </DataTable>
      </div>

      {/* Cutter Completion Modal */}
      <Dialog open={Boolean(selectedLotForCut)} onOpenChange={(next) => !next && setSelectedLotForCut(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle>قرار تشذيب البقايا</DialogTitle>
                {selectedLotForCut && (
                  <DialogDescription>
                    الدفعة الأصلية: <span className="font-mono font-bold">{selectedLotForCut.lot_number}</span>
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
                    إجراء التصرف في البقايا
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
                      إعادة تخزين قالب البقايا
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
                      تحويل إلى حشو ثانوي
                    </button>
                  </div>
                </div>

                {remnantAction === "restock_remnant" && (
                  <div className="space-y-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
                    <div className="text-xs font-bold text-app-label-primary">
                      إدخال المشغل: أبعاد قالب البقايا (الطول × العرض × الارتفاع)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-app-label-secondary mb-1">الطول (م)</label>
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
                        <label className="block text-xs text-app-label-secondary mb-1">العرض (م)</label>
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
                        <label className="block text-xs text-app-label-secondary mb-1">الارتفاع (م)</label>
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
                      الحجم المحسوب للبقايا:{" "}
                      <span className="font-bold text-app-accent font-mono">
                        {(lengthM * widthM * heightM).toFixed(4)} m³
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    وزن نشارة التشذيب / الحشو الثانوي (كجم، اختياري)
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
                    إتمام هذا الإجراء سيضع الدفعة{" "}
                    <span className="font-mono font-bold">{selectedLotForCut.lot_number}</span> في حالة مستهلك.
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
              إلغاء
            </button>
            <button
              type="submit"
              form="cut-remnant-form"
              disabled={processCutMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {processCutMutation.isPending ? "جاري تنفيذ التشذيب…" : "تأكيد التصرف في البقايا"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseItemDetailPage;
