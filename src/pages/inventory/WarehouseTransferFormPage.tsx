import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowLeftRight, ArrowRight, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  useWarehouseTransfer,
  useCreateWarehouseTransfer,
  useUpdateWarehouseTransfer,
} from "../../hooks/useWarehouseTransfers";
import { useInventoryItems } from "../../hooks/useInventory";
import { useWarehouses } from "../../hooks/useWarehouses";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { type InventoryItem } from "../../api/endpoints/inventory";
import type { Warehouse } from "../../types/entities";
import { toast } from "../../stores/toastStore";

interface DraftLine {
  key: string;
  inventoryItemId: string;
  quantity: string;
}

const newDraftLine = (): DraftLine => ({
  key: Math.random().toString(36).slice(2),
  inventoryItemId: "",
  quantity: "",
});

const generateSuggestedNumber = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSeq = String(Math.floor(10 + Math.random() * 90));
  return `XFER-${dateStr}-${randomSeq}`;
};

const WarehouseTransferFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: editingTransfer, isLoading: isLoadingTransfer } = useWarehouseTransfer(id);
  const { data: itemsPage } = useInventoryItems();
  const inventoryItems = itemsPage?.data ?? [];
  const { data: warehouses } = useWarehouses();
  const createMutation = useCreateWarehouseTransfer();
  const updateMutation = useUpdateWarehouseTransfer();

  const [transferNumber, setTransferNumber] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newDraftLine()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !editingTransfer) return;

    if (editingTransfer.status !== "draft") {
      navigate(`/inventory/transfers/${editingTransfer.id}`, { replace: true });
      return;
    }

    setTransferNumber(editingTransfer.transfer_number);
    setFromWarehouseId(editingTransfer.from_warehouse_id);
    setToWarehouseId(editingTransfer.to_warehouse_id);
    setReason(editingTransfer.reason ?? "");
    setLines(
      editingTransfer.lines.length > 0
        ? editingTransfer.lines.map((l) => ({
            key: l.id,
            inventoryItemId: l.inventory_item_id,
            quantity: String(l.quantity),
          }))
        : [newDraftLine()],
    );
  }, [isEdit, editingTransfer, navigate]);

  const destinationOptions = useMemo(
    () => (warehouses ?? []).filter((w) => w.id !== fromWarehouseId),
    [warehouses, fromWarehouseId],
  );

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const removeLine = (key: string) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromWarehouseId || !toWarehouseId) {
      setError("يرجى اختيار مخزن المصدر والوجهة.");
      return;
    }

    const validLines = lines.filter((l) => l.inventoryItemId && l.quantity.trim());
    if (validLines.length === 0) {
      setError("أضف صنفًا واحدًا على الأقل مع الكمية.");
      return;
    }

    const linesPayload = validLines.map((l) => ({
      inventory_item_id: l.inventoryItemId,
      quantity: Number(l.quantity),
    }));

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            from_warehouse_id: fromWarehouseId,
            to_warehouse_id: toWarehouseId,
            reason: reason.trim() || null,
            lines: linesPayload,
          },
        });
        toast.success("تم تحديث المسودة بنجاح");
        navigate(`/inventory/transfers/${id}`);
      } else {
        const res = await createMutation.mutateAsync({
          transfer_number: transferNumber.trim(),
          from_warehouse_id: fromWarehouseId,
          to_warehouse_id: toWarehouseId,
          reason: reason.trim() || null,
          lines: linesPayload,
        });
        toast.success("تم إنشاء مسودة النقل بنجاح");
        navigate(`/inventory/transfers/${res.data.id}`);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object") {
          const firstKey = Object.keys(errors)[0];
          const firstMsg = errors[firstKey]?.[0];
          if (firstMsg) {
            setError(String(firstMsg));
            return;
          }
        }
        setError(err.response?.data?.message ?? "فشل حفظ النقل");
      } else {
        setError("فشل حفظ النقل");
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingTransfer) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات النقل…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Link
        to="/inventory/transfers"
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى النقل بين المخازن
      </Link>

      <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
        <ArrowLeftRight className="w-6 h-6 text-app-accent" />
        {isEdit ? `تعديل مسودة النقل: ${editingTransfer?.transfer_number ?? ""}` : "إنشاء نقل بين المخازن"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {error && (
          <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2.5 text-xs text-app-status-danger">
            {error}
          </div>
        )}

        {!isEdit && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-app-label-secondary uppercase">رقم النقل</label>
              <button
                type="button"
                onClick={() => setTransferNumber(generateSuggestedNumber())}
                className="flex items-center gap-1 text-[11px] font-bold text-app-accent hover:opacity-80 transition-opacity"
              >
                <Sparkles className="w-3 h-3" />
                <span>توليد تلقائي</span>
              </button>
            </div>
            <input
              type="text"
              required
              dir="ltr"
              placeholder="مثال: XFER-260926-01"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">من مخزن</label>
            <SearchableSelect<Warehouse>
              options={warehouses ?? []}
              value={warehouses?.find((w) => w.id === fromWarehouseId) ?? null}
              onChange={(w) => {
                setFromWarehouseId(w ? w.id : "");
                if (w && w.id === toWarehouseId) setToWarehouseId("");
              }}
              getOptionId={(w) => w.id}
              getOptionLabel={(w) => w.name}
              placeholder="المخزن المصدر…"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">إلى مخزن</label>
            <SearchableSelect<Warehouse>
              options={destinationOptions}
              value={warehouses?.find((w) => w.id === toWarehouseId) ?? null}
              onChange={(w) => setToWarehouseId(w ? w.id : "")}
              getOptionId={(w) => w.id}
              getOptionLabel={(w) => w.name}
              placeholder="المخزن الوجهة…"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
            سبب النقل (اختياري)
          </label>
          <input
            type="text"
            placeholder="مثال: إعادة توزيع مخزون"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="space-y-3 p-3.5 bg-app-bg-secondary rounded-xl border border-app-separator">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-primary">أصناف النقل</span>
            <span className="text-[11px] text-app-label-tertiary">
              لن يتحرك أي مخزون فعلياً حتى تُتمّ هذا النقل.
            </span>
          </div>

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.key} className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchableSelect<InventoryItem>
                    options={inventoryItems}
                    value={inventoryItems.find((i) => i.id === line.inventoryItemId) ?? null}
                    onChange={(i) => updateLine(line.key, { inventoryItemId: i ? i.id : "" })}
                    getOptionId={(i) => i.id}
                    getOptionLabel={(i) => i.name}
                    getOptionSubLabel={(i) => i.code}
                    getOptionSearchText={(i) => `${i.name} ${i.code}`}
                    placeholder="اختر صنفًا…"
                    size="sm"
                  />
                </div>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  placeholder="الكمية"
                  value={line.quantity}
                  onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                  className="w-32 px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  disabled={lines.length <= 1}
                  className="rounded-lg p-1.5 text-app-status-danger hover:bg-app-status-danger/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="حذف الصنف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, newDraftLine()])}
            className="flex items-center gap-1.5 text-xs font-semibold text-app-accent hover:underline w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة صنف
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "جاري الحفظ…" : isEdit ? "تحديث المسودة" : "حفظ كمسودة"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/inventory/transfers")}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarehouseTransferFormPage;
