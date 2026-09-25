import React, { useMemo, useState } from "react";
import { useStockLots, useInventoryValuation, useProcessCutRemnant, useInventoryItems } from "../../hooks/useInventory";
import { useItemCategories } from "../../hooks/useCategories";
import { StockLot } from "../../api/endpoints/inventory";
import { formatNumber } from "../../lib/utils/format";
import { Layers, Box, CheckCircle, DollarSign, RefreshCw, Scissors, AlertCircle, PackagePlus } from "lucide-react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useStockLedgerColumns } from "../../components/table-columns/stockLedgerColumns";
import { StockIntakeModal } from "./StockIntakeModal";

export const StockLedgerPage: React.FC = () => {
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedLotForCut, setSelectedLotForCut] = useState<StockLot | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

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
  const { data: itemData } = useInventoryItems({});
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

  const openCutModal = (lot: StockLot) => {
    setSelectedLotForCut(lot);
    setLengthM(lot.length_m ? Number((lot.length_m / 2).toFixed(2)) : 1.0);
    setWidthM(lot.width_m || 2.0);
    setHeightM(lot.height_m || 1.0);
  };

  const columns = useStockLedgerColumns({ onOpenCutModal: openCutModal });

  const tableData = useMemo(() => lotData?.data ?? [], [lotData]);
  const stockLotsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (lot) => lot.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Layers className="w-7 h-7 text-app-accent" />
            سجل المخزون المسلسل والدفعات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            قوالب إسفنج مسلسلة، وحدة قياس مزدوجة، خصائص فئة ديناميكية، حجم (م³)، درجة الجودة، ومراجعة الحالة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <button
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <PackagePlus className="w-4 h-4" /> استلام مخزون
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">تقييم مخزون الوحدة</div>
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
            <div className="text-xs uppercase font-semibold text-app-label-secondary">الدفعات المسلسلة المتاحة</div>
            <div className="text-xl font-bold text-app-label-primary">
              {valuation?.total_lots || 0} دفعة
            </div>
          </div>
        </div>

        <div className="bg-app-bg-primary p-5 rounded-2xl border border-app-separator shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-app-label-secondary">إجمالي أصناف المخزون</div>
            <div className="text-xl font-bold text-app-label-primary">
              {itemData?.total || 0} صنف
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
            placeholder="كل الفئات"
            size="sm"
          />
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
        >
          <option value="">كل درجات الجودة</option>
          <option value="standard">درجة قياسية</option>
          <option value="acceptable_variant">تفاوت مقبول</option>
          <option value="defective_usable">معيب قابل للاستخدام</option>
          <option value="reject">مرفوض</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
        >
          <option value="">كل الحالات</option>
          <option value="available">متاح</option>
          <option value="reserved">محجوز</option>
          <option value="consumed">مستهلك</option>
          <option value="quarantined">قيد الحجر</option>
        </select>
      </div>

      {/* Stock Lots Table */}
      <DataTable table={stockLotsTable}>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage="لا توجد دفعات مخزون مسلسلة مطابقة للمرشحات."
          emptyIcon={Layers}
        />
        <DataTable.Pagination />
      </DataTable>

      {/* Option C: Cutter Completion Modal */}
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
                    الحجم المحسوب للبقايا: <span className="font-bold text-app-accent font-mono">{(lengthM * widthM * heightM).toFixed(4)} m³</span>
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
                  إتمام هذا الإجراء سيضع الدفعة <span className="font-mono font-bold">{selectedLotForCut.lot_number}</span> في حالة مستهلك.
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

      {isIntakeOpen && (
        <StockIntakeModal items={itemData?.data ?? []} onClose={() => setIsIntakeOpen(false)} />
      )}
    </div>
  );
};
