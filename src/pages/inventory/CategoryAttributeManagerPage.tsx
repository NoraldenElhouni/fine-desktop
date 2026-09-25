import React, { useState } from "react";
import { useItemCategories, useCreateItemCategory } from "../../hooks/useCategories";
import { ItemCategory, InventoryItemType, ITEM_TYPE_LABELS } from "../../api/endpoints/categories";
import { Tags, Plus, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

export const CategoryAttributeManagerPage: React.FC = () => {
  const { data: categories, isLoading } = useItemCategories();
  const createCatMutation = useCreateItemCategory();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // New Category Form State
  const [catName, setCatName] = useState("");
  const [catCode, setCatCode] = useState("");
  const [catItemType, setCatItemType] = useState<InventoryItemType>("raw_material");
  const [catDesc, setCatDesc] = useState("");

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCatMutation.mutate(
      { name: catName, code: catCode, item_type: catItemType, description: catDesc },
      {
        onSuccess: () => {
          setIsCatModalOpen(false);
          setCatName("");
          setCatCode("");
          setCatItemType("raw_material");
          setCatDesc("");
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Tags className="w-7 h-7 text-app-accent" />
            فئات الأصناف
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            تهيئة فئات الأصناف ونوع الصنف الافتراضي لكل فئة.
          </p>
        </div>

        <button
          onClick={() => setIsCatModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> إضافة فئة صنف
        </button>
      </div>

      <div className="bg-app-bg-primary rounded-2xl border border-app-separator p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-app-accent" /> فئات المنتجات
        </h3>

        {isLoading ? (
          <div className="p-4 text-center text-xs text-app-label-secondary">جاري تحميل الفئات…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories?.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-app-accent bg-app-accent-subtle text-app-accent"
                      : "border-app-separator bg-app-bg-secondary text-app-label-primary hover:bg-app-fill-f1"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{cat.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-app-bg-primary border border-app-separator">
                      {cat.code}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-app-label-secondary mt-1 line-clamp-1">{cat.description}</p>
                  )}
                  {cat.item_type && (
                    <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded bg-app-accent-subtle text-app-accent font-medium">
                      {ITEM_TYPE_LABELS[cat.item_type] ?? cat.item_type}
                    </span>
                  )}
                </div>
              );
            })}
            {categories?.length === 0 && (
              <div className="col-span-full p-6 text-center text-xs text-app-label-tertiary">لا توجد فئات بعد.</div>
            )}
          </div>
        )}
      </div>

      {/* Category Creation Modal */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>إنشاء فئة صنف</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form id="category-create-form" onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">اسم الفئة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قوالب الإسفنج"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">رمز الفئة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: CAT-FOAM"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  نوع الصنف المرتبط بالفئة
                </label>
                <select
                  value={catItemType}
                  onChange={(e) => setCatItemType(e.target.value as InventoryItemType)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                >
                  <option value="raw_material">مادة خام</option>
                  <option value="foam_block">قالب إسفنج</option>
                  <option value="cut_template_piece">قطعة قالب تشذيب</option>
                  <option value="slice">شريحة</option>
                  <option value="byproduct_fill">حشو ثانوي</option>
                  <option value="furniture_finished_good">منتج أثاث تام</option>
                  <option value="barrel">برميل</option>
                  <option value="pallet">منصة نقالة</option>
                  <option value="packaging">تغليف</option>
                </select>
                <p className="text-[11px] text-app-label-tertiary mt-1">
                  يُحدّد هذا الحقل نوع الصنف الافتراضي عند إنشاء أصناف تابعة لهذه الفئة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">الوصف</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="category-create-form"
              disabled={createCatMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {createCatMutation.isPending ? "جاري الإنشاء…" : "حفظ الفئة"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
