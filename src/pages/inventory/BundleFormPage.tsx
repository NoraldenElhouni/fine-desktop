import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowRight, Package2, Plus, Trash2 } from "lucide-react";
import { useBundle, useCreateBundle, useUpdateBundle } from "../../hooks/useBundles";
import { useInventoryItems } from "../../hooks/useInventory";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { type InventoryItem } from "../../api/endpoints/inventory";
import { toast } from "../../stores/toastStore";

interface DraftItem {
  key: string;
  inventoryItemId: string;
  suggestedQuantity: string;
}

const newDraftItem = (): DraftItem => ({
  key: Math.random().toString(36).slice(2),
  inventoryItemId: "",
  suggestedQuantity: "",
});

const BundleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: editingBundle, isLoading: isLoadingBundle } = useBundle(id);
  const { data: itemsPage } = useInventoryItems();
  const inventoryItems = itemsPage?.data ?? [];
  const createMutation = useCreateBundle();
  const updateMutation = useUpdateBundle();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<DraftItem[]>([newDraftItem()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !editingBundle) return;
    setName(editingBundle.name);
    setDescription(editingBundle.description ?? "");
    setItems(
      editingBundle.items.length > 0
        ? editingBundle.items.map((i) => ({
            key: i.id,
            inventoryItemId: i.inventory_item_id,
            suggestedQuantity: i.suggested_quantity ? String(i.suggested_quantity) : "",
          }))
        : [newDraftItem()],
    );
  }, [isEdit, editingBundle]);

  const updateItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const removeItem = (key: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((i) => i.inventoryItemId);
    if (validItems.length === 0) {
      setError("أضف صنفًا واحدًا على الأقل إلى الحزمة.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      items: validItems.map((i) => ({
        inventory_item_id: i.inventoryItemId,
        suggested_quantity: i.suggestedQuantity.trim() ? Number(i.suggestedQuantity) : null,
      })),
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success("تم تحديث الحزمة بنجاح");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("تم إنشاء الحزمة بنجاح");
      }
      navigate("/settings/products/bundles");
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
        setError(err.response?.data?.message ?? "فشل حفظ الحزمة");
      } else {
        setError("فشل حفظ الحزمة");
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingBundle) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات الحزمة…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Link
        to="/settings/products/bundles"
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الحزم
      </Link>

      <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
        <Package2 className="w-6 h-6 text-app-accent" />
        {isEdit ? `تعديل الحزمة: ${editingBundle?.name ?? ""}` : "إضافة حزمة"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {error && (
          <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2.5 text-xs text-app-status-danger">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
            اسم الحزمة
          </label>
          <input
            type="text"
            required
            placeholder="مثال: طقم غرفة نوم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
            الوصف (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="space-y-3 p-3.5 bg-app-bg-secondary rounded-xl border border-app-separator">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-label-primary">أصناف الحزمة</span>
            <span className="text-[11px] text-app-label-tertiary">
              الكمية هنا اقتراحية فقط — تُحدَّد فعليًا عند البيع.
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchableSelect<InventoryItem>
                    options={inventoryItems}
                    value={inventoryItems.find((i) => i.id === item.inventoryItemId) ?? null}
                    onChange={(i) => updateItem(item.key, { inventoryItemId: i ? i.id : "" })}
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
                  step="0.01"
                  min="0"
                  placeholder="الكمية المقترحة"
                  value={item.suggestedQuantity}
                  onChange={(e) => updateItem(item.key, { suggestedQuantity: e.target.value })}
                  className="w-36 px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length <= 1}
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
            onClick={() => setItems((prev) => [...prev, newDraftItem()])}
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
            {isSubmitting ? "جاري الحفظ…" : isEdit ? "تحديث الحزمة" : "حفظ الحزمة"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings/products/bundles")}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default BundleFormPage;
