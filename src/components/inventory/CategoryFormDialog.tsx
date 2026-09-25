import React, { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/Dialog";
import { useCreateItemCategory, useUpdateItemCategory } from "../../hooks/useCategories";
import { InventoryItemType, ItemCategory } from "../../api/endpoints/categories";
import { toast } from "../../stores/toastStore";

export interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Editing an existing category. Omit to create a new one. */
  category?: ItemCategory | null;
  /** Parent category id when creating a child. Ignored for top-level categories and edits. */
  parentId?: string;
  /** Shown in the dialog title when creating a child, e.g. the parent's name. */
  parentLabel?: string;
}

const ITEM_TYPE_OPTIONS: { value: InventoryItemType; label: string }[] = [
  { value: "raw_material", label: "مادة خام" },
  { value: "foam_block", label: "قالب إسفنج" },
  { value: "cut_template_piece", label: "قطعة قالب تشذيب" },
  { value: "slice", label: "شريحة" },
  { value: "byproduct_fill", label: "حشو ثانوي" },
  { value: "furniture_finished_good", label: "منتج أثاث تام" },
  { value: "barrel", label: "برميل" },
  { value: "pallet", label: "منصة نقالة" },
  { value: "packaging", label: "تغليف" },
];

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  category,
  parentId,
  parentLabel,
}) => {
  const isEdit = Boolean(category);
  const createMutation = useCreateItemCategory();
  const updateMutation = useUpdateItemCategory();

  const [name, setName] = useState("");
  const [codeSegment, setCodeSegment] = useState("");
  const [code, setCode] = useState("");
  const [itemType, setItemType] = useState<InventoryItemType | "">("");
  const [childCodeLength, setChildCodeLength] = useState("2");
  const [productCodeLength, setProductCodeLength] = useState("3");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setCodeSegment(category?.code_segment ?? "");
    setCode(category?.code ?? "");
    setItemType((category?.item_type as InventoryItemType) ?? "");
    setChildCodeLength(String(category?.child_code_length ?? 2));
    setProductCodeLength(String(category?.product_code_length ?? 3));
    setDescription(category?.description ?? "");
    setError(null);
  }, [open, category]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      code_segment: codeSegment.trim(),
      code: code.trim(),
      item_type: itemType || undefined,
      child_code_length: Number(childCodeLength) || 2,
      product_code_length: Number(productCodeLength) || 3,
      description: description.trim() || undefined,
      ...(isEdit ? {} : { parent_id: parentId ?? null }),
    };

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, data: payload });
        toast.success("تم تحديث الفئة بنجاح");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("تم إنشاء الفئة بنجاح");
      }
      onClose();
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
        setError(err.response?.data?.message ?? "فشل حفظ الفئة");
      } else {
        setError("فشل حفظ الفئة");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? `تعديل الفئة: ${category?.name ?? ""}`
              : parentId
                ? `فئة فرعية جديدة${parentLabel ? ` تحت "${parentLabel}"` : ""}`
                : "إنشاء فئة جديدة"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <form id="category-form-dialog" onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2.5 text-xs text-app-status-danger">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                اسم الفئة
              </label>
              <input
                type="text"
                required
                placeholder="مثال: قوالب الإسفنج"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  جزء الرمز الخاص (code_segment)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 01"
                  value={codeSegment}
                  onChange={(e) => setCodeSegment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  الرمز الكامل (code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 0101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  طول رمز الفروع
                </label>
                <input
                  type="number"
                  min={1}
                  value={childCodeLength}
                  onChange={(e) => setChildCodeLength(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-app-label-tertiary mt-1">
                  عدد الخانات المحجوزة لرمز كل فئة فرعية مباشرة.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  طول رمز المنتج
                </label>
                <input
                  type="number"
                  min={1}
                  value={productCodeLength}
                  onChange={(e) => setProductCodeLength(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-app-label-tertiary mt-1">
                  عدد الخانات المحجوزة لرقم تسلسل المنتج تحت هذه الفئة.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                نوع الصنف المرتبط بالفئة
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as InventoryItemType)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
              >
                <option value="">— بدون نوع افتراضي —</option>
                {ITEM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="category-form-dialog"
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isPending ? "جاري الحفظ…" : isEdit ? "حفظ التعديلات" : "حفظ الفئة"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
