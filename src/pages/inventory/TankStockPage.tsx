import React, { useState } from "react";
import {
  useTankStocks,
  useRefillTank,
  useRefillFromLot,
  useInventoryItems,
  useStockLots,
} from "../../hooks/useInventory";
import { TankStock, InventoryItem, StockLot } from "../../api/endpoints/inventory";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { Database, Plus, AlertCircle, PackageOpen } from "lucide-react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from "../../components/ui/Dialog";

export const TankStockPage: React.FC = () => {
  const { data: tanks, isLoading, refetch } = useTankStocks();
  const { data: items } = useInventoryItems({ item_type: "raw_material" });

  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [selectedChemicalId, setSelectedChemicalId] = useState("");
  const [operatingUnitId, setOperatingUnitId] = useState("");
  const [refillQty, setRefillQty] = useState(1000);
  const [refillCost, setRefillCost] = useState(15.0);
  const [error, setError] = useState<string | null>(null);

  // Sourced refill: draw from a real lot so stock moves rather than appearing.
  const [sourceLotId, setSourceLotId] = useState("");
  const [drawMode, setDrawMode] = useState<"containers" | "quantity">("containers");
  const [drawContainers, setDrawContainers] = useState(1);
  const [drawQuantity, setDrawQuantity] = useState(0);

  const refillMutation = useRefillTank();
  const refillFromLotMutation = useRefillFromLot();

  const { data: sourceLots } = useStockLots({
    inventory_item_id: selectedChemicalId || undefined,
    status: "available",
  });

  const chemical = items?.data.find((i) => i.id === selectedChemicalId);
  const capacity = chemical?.container_capacity ? Number(chemical.container_capacity) : null;
  const selectedLot = sourceLots?.data.find((l) => l.id === sourceLotId);

  const handleRefillFromLot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    refillFromLotMutation.mutate(
      {
        source_stock_lot_id: sourceLotId,
        ...(drawMode === "containers"
          ? { draw_containers: drawContainers }
          : { draw_quantity: drawQuantity }),
      },
      {
        onSuccess: () => {
          setIsRefillOpen(false);
          setSourceLotId("");
          refetch();
        },
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر السحب من هذه الدفعة."),
      },
    );
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    refillMutation.mutate(
      {
        chemical_inventory_item_id: selectedChemicalId,
        operating_unit_id: operatingUnitId,
        refill_quantity: refillQty,
        refill_unit_cost: refillCost,
      },
      {
        onSuccess: () => {
          setIsRefillOpen(false);
          refetch();
        },
        onError: (err: unknown) =>
          setError(apiErrorPayload(err)?.message ?? "تعذر تعديل الخزان."),
      }
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Database className="w-7 h-7 text-app-accent" />
            إدارة خزانات المواد الكيميائية السائبة
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            خزانات المواد الخام السائبة مع إعادة احتساب فورية لمتوسط التكلفة المرجح (WAC) عند كل تعبئة.
          </p>
        </div>

        <button
          onClick={() => setIsRefillOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> إدخال تعبئة خزان
        </button>
      </div>

      {/* Tank Cards Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جاري تحميل الخزانات السائبة…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tanks?.map((tank: TankStock) => (
            <div
              key={tank.id}
              className="bg-app-bg-primary rounded-2xl border border-app-separator p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-app-label-primary">
                      {tank.chemical_item?.name || "خزان كيميائي سائب"}
                    </h3>
                    <div className="text-xs text-app-label-tertiary font-mono">{tank.chemical_item?.sku}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-app-separator py-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-app-label-secondary">الحجم الحالي:</span>
                  <span className="font-bold text-app-label-primary text-sm">
                    {formatNumber(tank.quantity_on_hand)} لتر
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-app-label-secondary">متوسط تكلفة الوحدة المرجح (WAC):</span>
                  <span className="font-mono font-bold text-app-accent">
                    {formatNumber(tank.weighted_avg_unit_cost)} LYD / L
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-app-label-secondary">إجمالي قيمة الخزان:</span>
                  <span className="font-semibold text-app-label-primary">
                    {formatNumber(tank.quantity_on_hand * tank.weighted_avg_unit_cost)} LYD
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-app-label-tertiary">
                <span>الإصدار: #{tank.record_version}</span>
                <span>آخر تحديث: {formatDate(tank.created_at)}</span>
              </div>
            </div>
          ))}

          {tanks?.length === 0 && (
            <div className="col-span-full p-12 text-center bg-app-bg-primary rounded-2xl border border-app-separator text-xs text-app-label-tertiary">
              لا توجد خزانات مواد كيميائية سائبة مسجلة لهذه الوحدة حاليًا.
            </div>
          )}
        </div>
      )}

      {/* Refill Modal */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>تعبئة الخزان وقيد متوسط التكلفة المرجح</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Sourced pour: the balanced path. Stock moves out of a real lot,
                the cost comes with it, and drained containers come back. */}
            {selectedChemicalId && (sourceLots?.data.length ?? 0) > 0 && (
              <form
                onSubmit={handleRefillFromLot}
                className="space-y-3 rounded-xl border border-app-accent/40 bg-app-accent-tint p-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-app-accent">
                  <PackageOpen className="w-4 h-4" /> سحب من المخزون
                </div>

                <label className="block text-xs font-semibold text-app-label-secondary mb-1">دفعة المصدر</label>
                <SearchableSelect<StockLot>
                  options={sourceLots?.data ?? []}
                  value={
                    sourceLots?.data.find((l) => l.id === sourceLotId) ?? null
                  }
                  onChange={(lot) => setSourceLotId(lot ? lot.id : "")}
                  getOptionId={(l) => l.id}
                  getOptionLabel={(l) => l.lot_number}
                  getOptionSubLabel={(l) =>
                    `${l.quantity} ${chemical?.secondary_uom ?? ""}${l.container_quantity ? ` × ${l.container_quantity} ${chemical?.primary_uom ?? "container"}` : ""} · ${l.unit_cost}`
                  }
                  getOptionSearchText={(l) => l.lot_number}
                  placeholder="اختر دفعة المصدر…"
                />

                {sourceLotId && (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawMode("containers")}
                        disabled={!capacity}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
                          drawMode === "containers"
                            ? "border-app-accent bg-app-accent text-white"
                            : "border-app-separator bg-app-bg-primary text-app-label-secondary"
                        }`}
                      >
                        كامل {chemical?.primary_uom ?? "containers"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawMode("quantity")}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          drawMode === "quantity"
                            ? "border-app-accent bg-app-accent text-white"
                            : "border-app-separator bg-app-bg-primary text-app-label-secondary"
                        }`}
                      >
                        جزئي {chemical?.secondary_uom ?? "amount"}
                      </button>
                    </div>

                    {drawMode === "containers" ? (
                      <div>
                        <label className="block text-xs font-semibold text-app-label-secondary mb-1">عدد الأوعية / البراميل</label>
                        <input
                          type="number"
                          min="1"
                          value={drawContainers}
                          onChange={(e) => setDrawContainers(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                        />
                        {capacity && (
                          <p className="text-[10px] text-app-label-tertiary mt-1">
                            = {(drawContainers * capacity).toFixed(2)} {chemical?.secondary_uom}
                            {" · "}الأوعية الفارغة المستردة: {drawContainers}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-app-label-secondary mb-1">الكمية المسحوبة</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={selectedLot ? Number(selectedLot.quantity) : undefined}
                          value={drawQuantity}
                          onChange={(e) => setDrawQuantity(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs font-mono focus:border-app-accent focus:outline-none"
                        />
                        <p className="text-[10px] text-app-label-tertiary mt-1">
                          الوعاء المسحوب جزئيًا يبقى في الموقع ويظل محتسبًا ضمن الجرد.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-app-label-secondary">
                      التكلفة مأخوذة من الدفعة ({selectedLot?.unit_cost})، وليست مُدخلة يدويًا.
                    </p>

                    <button
                      type="submit"
                      disabled={refillFromLotMutation.isPending}
                      className="w-full px-4 py-2 text-xs font-bold text-white bg-app-accent rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {refillFromLotMutation.isPending ? "جاري السكب…" : "سكب في الخزان"}
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="pt-2 border-t border-app-separator">
              <p className="text-[10px] font-semibold uppercase text-app-label-tertiary mb-2">
                تعديل يدوي — للأرصدة الافتتاحية والتصحيحات فقط
              </p>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  المادة الكيميائية
                </label>
                <SearchableSelect<InventoryItem>
                  options={items?.data ?? []}
                  value={
                    items?.data.find((i) => i.id === selectedChemicalId) ?? null
                  }
                  onChange={(item) =>
                    setSelectedChemicalId(item ? item.id : "")
                  }
                  getOptionId={(item) => item.id}
                  getOptionLabel={(item) => item.name}
                  getOptionSubLabel={(item) => item.sku}
                  getOptionSearchText={(item) => `${item.name} ${item.sku}`}
                  placeholder="اختر مادة خام كيميائية"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  معرف الوحدة التشغيلية
                </label>
                <input
                  type="text"
                  required
                  placeholder="معرف الوحدة التشغيلية (UUID)"
                  value={operatingUnitId}
                  onChange={(e) => setOperatingUnitId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    كمية التعبئة (لتر)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={refillQty}
                    onChange={(e) => setRefillQty(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    سعر الوحدة (LYD/L)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={refillCost}
                    onChange={(e) => setRefillCost(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 flex items-start gap-2 border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  التعبئة ستحدّث تلقائيًا متوسط تكلفة الوحدة المرجح (WAC) بناءً على حجم الخزان الحالي وتكلفة شراء التعبئة.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsRefillOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={refillMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {refillMutation.isPending ? "جاري تنفيذ التعبئة…" : "تأكيد التعبئة"}
                </button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};
