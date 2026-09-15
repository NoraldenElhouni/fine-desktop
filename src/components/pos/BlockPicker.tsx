import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody } from "../ui/Dialog";
import { useAvailableFoamBlocks } from "../../hooks/useInventory";
import { StockLot } from "../../api/endpoints/inventory";
import { Search, Package, X } from "lucide-react";

export interface PickedBlock {
  id: string;
  lot_number: string;
  volume_m3: number;
  length_m: number;
  width_m: number;
  height_m: number;
  unit_cost: number;
  grade: string;
}

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (block: PickedBlock) => void;
  inventoryItemId: string;
  inventoryItemName: string;
  initiallySelectedLotId?: string | null;
}

const GRADE_LABEL: Record<string, string> = {
  standard: "معياري",
  acceptable_variant: "مقبول",
  defective_usable: "مقبول بعيوب",
  reject: "مرفوض",
};

export const BlockPicker: React.FC<BlockPickerProps> = ({
  isOpen,
  onClose,
  onPick,
  inventoryItemId,
  inventoryItemName,
  initiallySelectedLotId,
}) => {
  const [grade, setGrade] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAvailableFoamBlocks({
    inventory_item_id: inventoryItemId,
    grade: grade || undefined,
    per_page: 50,
  });

  const lots = data?.data ?? [];
  const filtered = search.trim()
    ? lots.filter((l) => l.lot_number.toLowerCase().includes(search.trim().toLowerCase()))
    : lots;

  const handlePick = (lot: StockLot) => {
    onPick({
      id: lot.id,
      lot_number: lot.lot_number,
      volume_m3: Number(lot.volume_m3),
      length_m: Number(lot.length_m),
      width_m: Number(lot.width_m),
      height_m: Number(lot.height_m),
      unit_cost: Number(lot.unit_cost),
      grade: lot.grade,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div>
            <DialogTitle>اختر قطعة إسفنج</DialogTitle>
            <DialogDescription>
              {inventoryItemName} — القطع المتاحة مرتبة من الأصغر للأكبر
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[12rem]">
            <Search className="absolute inset-y-0 start-2 my-auto h-3.5 w-3.5 text-app-label-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم اللوت..."
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary ps-7 pe-2 py-1.5 text-xs focus:outline-none focus:border-app-accent"
            />
          </div>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-2 py-1.5 text-xs focus:outline-none"
          >
            <option value="">كل الدرجات</option>
            <option value="standard">معياري</option>
            <option value="acceptable_variant">مقبول</option>
            <option value="defective_usable">مقبول بعيوب</option>
            <option value="reject">مرفوض</option>
          </select>
          {initiallySelectedLotId && (
            <button
              type="button"
              onClick={() => {
                onPick({
                  id: "",
                  lot_number: "",
                  volume_m3: 0,
                  length_m: 0,
                  width_m: 0,
                  height_m: 0,
                  unit_cost: 0,
                  grade: "",
                });
                onClose();
              }}
              className="flex items-center gap-1 rounded-xl border border-app-status-danger/30 bg-app-status-danger/5 px-2.5 py-1.5 text-[11px] font-bold text-app-status-danger hover:bg-app-status-danger/10"
            >
              <X className="h-3.5 w-3.5" /> إزالة القطعة المختارة
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-app-label-tertiary">
            لا توجد قطع متاحة بهذه المواصفات.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((b) => {
              const isSelected = initiallySelectedLotId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handlePick(b)}
                  className={`text-start rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-app-accent bg-app-accent/10 ring-2 ring-app-accent/30"
                      : "border-app-separator bg-app-bg-primary hover:border-app-accent hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-app-accent" />
                    <div className="font-mono font-bold text-app-accent text-xs">
                      {b.lot_number}
                    </div>
                  </div>
                  <div className="text-[11px] text-app-label-secondary mt-1 font-mono">
                    {b.length_m}×{b.width_m}×{b.height_m} م
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] font-bold text-app-label-primary font-mono">
                      {Number(b.volume_m3).toFixed(4)} م³
                    </span>
                    <span className="text-[11px] text-app-label-secondary font-mono">
                      تكلفة {Number(b.unit_cost).toLocaleString()}
                    </span>
                  </div>
                  {b.grade && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded bg-app-fill-f1 text-app-label-secondary">
                      {GRADE_LABEL[b.grade] ?? b.grade}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
