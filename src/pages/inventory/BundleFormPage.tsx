import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Package2, Plus, Trash2 } from "lucide-react";
import {
  useBundle,
  useCreateBundle,
  useUpdateBundle,
} from "../../hooks/useBundles";
import { useInventoryItems } from "../../hooks/useInventory";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  Field,
  GuidedFormLoading,
  GuidedFormPage,
  Question,
  SummaryRow,
  formInputClass as inputClass,
} from "../../components/ui/GuidedForm";
import { type InventoryItem, UOM_LABELS } from "../../api/endpoints/inventory";
import { toast } from "../../stores/toastStore";
import { formatNumber } from "../../lib/utils/format";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const type = tokens.typography.webUI;

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
            suggestedQuantity: i.suggested_quantity
              ? String(i.suggested_quantity)
              : "",
          }))
        : [newDraftItem()],
    );
  }, [isEdit, editingBundle]);

  const findItem = (itemId: string) =>
    inventoryItems.find((i) => i.id === itemId);
  const unitOf = (item?: InventoryItem) =>
    item ? UOM_LABELS[item.unit_of_measure] || item.unit_of_measure : "";
  const chosenItems = items.filter((i) => i.inventoryItemId);

  const updateItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((i) => i.key !== key) : prev,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (chosenItems.length === 0) {
      setError("اختر صنفاً واحداً على الأقل لتضمّه الحزمة.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      items: chosenItems.map((i) => ({
        inventory_item_id: i.inventoryItemId,
        suggested_quantity: i.suggestedQuantity.trim()
          ? Number(i.suggestedQuantity)
          : null,
      })),
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success("تم حفظ التعديلات");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("تمت إضافة الحزمة");
      }
      navigate("/settings/products/bundles");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object") {
          const firstMsg = errors[Object.keys(errors)[0]]?.[0];
          if (firstMsg) {
            setError(String(firstMsg));
            return;
          }
        }
        setError(err.response?.data?.message ?? "تعذّر حفظ الحزمة");
      } else {
        setError("تعذّر حفظ الحزمة");
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingBundle) {
    return <GuidedFormLoading>جارٍ تحميل الحزمة…</GuidedFormLoading>;
  }

  return (
    <GuidedFormPage
      backTo="/settings/products/bundles"
      backLabel="الحزم"
      title={isEdit ? `تعديل: ${editingBundle?.name ?? ""}` : "حزمة جديدة"}
      error={error}
      onSubmit={handleSubmit}
      summaryIcon={Package2}
      summaryTitle={name}
      summaryPlaceholder="حزمة بدون اسم"
      summary={
        <>
          <SummaryRow label="عدد الأصناف">
            <span className="font-mono">{chosenItems.length}</span>
          </SummaryRow>
          {chosenItems.map((draft) => {
            const item = findItem(draft.inventoryItemId);
            const qty = Number(draft.suggestedQuantity);
            return (
              <SummaryRow key={draft.key} label={item?.name ?? "—"}>
                {qty > 0 ? (
                  <>
                    <span className="font-mono">{formatNumber(qty)}</span>{" "}
                    {unitOf(item)}
                  </>
                ) : (
                  <span className="text-app-label-tertiary">
                    تُحدَّد عند البيع
                  </span>
                )}
              </SummaryRow>
            );
          })}
        </>
      }
      submitLabel={isEdit ? "حفظ التعديلات" : "حفظ الحزمة"}
      isSubmitting={isSubmitting}
      onCancel={() => navigate("/settings/products/bundles")}
    >
      <Question number="1" title="ما هي الحزمة؟">
        <Field label="اسم الحزمة">
          <input
            type="text"
            required
            placeholder="مثال: طقم غرفة نوم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="وصف مختصر" hint="اختياري — يظهر للبائع عند اختيار الحزمة">
          <textarea
            rows={2}
            placeholder="مثال: سرير مزدوج + خزانة + تسريحة"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(inputClass, "resize-none")}
          />
        </Field>
      </Question>

      <Question
        number="2"
        title="ماذا تضمّ الحزمة؟"
        subtitle="الكمية اقتراح فقط — يمكن تعديلها عند البيع"
      >
        <div className="space-y-2">
          <div
            className={cn(
              type.c1Emphasized,
              "hidden sm:grid grid-cols-[1fr_10rem_2rem] gap-2 text-app-label-secondary",
            )}
          >
            <span>الصنف</span>
            <span>الكمية المقترحة</span>
            <span />
          </div>

          {items.map((draft) => {
            const item = findItem(draft.inventoryItemId);
            return (
              <div
                key={draft.key}
                className="grid grid-cols-[1fr_10rem_2rem] items-center gap-2"
              >
                <SearchableSelect<InventoryItem>
                  options={inventoryItems}
                  value={item ?? null}
                  onChange={(i) =>
                    updateItem(draft.key, { inventoryItemId: i ? i.id : "" })
                  }
                  getOptionId={(i) => i.id}
                  getOptionLabel={(i) => i.name}
                  getOptionSubLabel={(i) => i.code}
                  getOptionSearchText={(i) => `${i.name} ${i.code}`}
                  placeholder="اختر صنفاً"
                />
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="—"
                    value={draft.suggestedQuantity}
                    onChange={(e) =>
                      updateItem(draft.key, {
                        suggestedQuantity: e.target.value,
                      })
                    }
                    className={cn(inputClass, "font-mono pe-14")}
                    dir="ltr"
                  />
                  {item && (
                    <span
                      className={cn(
                        type.c1Regular,
                        "pointer-events-none absolute inset-y-0 right-3 flex items-center text-app-label-tertiary",
                      )}
                    >
                      {unitOf(item)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(draft.key)}
                  disabled={items.length <= 1}
                  title="إزالة"
                  className="flex h-8 w-8 items-center justify-center rounded-app-sm text-app-label-tertiary hover:bg-app-status-danger/10 hover:text-app-status-danger disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-app-label-tertiary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, newDraftItem()])}
          className={cn(
            type.c1Emphasized,
            "flex w-fit items-center gap-1.5 text-app-accent hover:underline",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة صنف آخر
        </button>
      </Question>
    </GuidedFormPage>
  );
};

export default BundleFormPage;
