import React, { useMemo, useState } from "react";
import { useItemCategories, useCreateItemCategory, useCreateAttributeDefinition, useDeleteAttributeDefinition } from "../../hooks/useCategories";
import { ItemCategory, InventoryItemType, ITEM_TYPE_LABELS } from "../../api/endpoints/categories";
import { Tags, Plus, Layers, Sliders } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useCategoryAttributeColumns } from "../../components/table-columns/categoryAttributeColumns";

export const CategoryAttributeManagerPage: React.FC = () => {
  const { data: categories, isLoading } = useItemCategories();
  const createCatMutation = useCreateItemCategory();
  const createAttrMutation = useCreateAttributeDefinition();
  const deleteAttrMutation = useDeleteAttributeDefinition();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);

  // New Category Form State
  const [catName, setCatName] = useState("");
  const [catCode, setCatCode] = useState("");
  const [catItemType, setCatItemType] = useState<InventoryItemType>("raw_material");
  const [catDesc, setCatDesc] = useState("");

  // New Attribute Form State
  const [attrName, setAttrName] = useState("");
  const [attrSlug, setAttrSlug] = useState("");
  const [attrDataType, setAttrDataType] = useState<"number" | "text" | "select" | "boolean">("number");
  const [attrUom, setAttrUom] = useState("");
  const [attrRequired, setAttrRequired] = useState(false);

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

  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    createAttrMutation.mutate(
      {
        categoryId: selectedCategory.id,
        data: {
          name: attrName,
          slug: attrSlug || attrName.toLowerCase().replace(/\s+/g, "_"),
          data_type: attrDataType,
          unit_of_measure: attrUom || undefined,
          is_required_on_lot: attrRequired,
        },
      },
      {
        onSuccess: () => {
          setIsAttrModalOpen(false);
          setAttrName("");
          setAttrSlug("");
          setAttrUom("");
        },
      }
    );
  };

  const handleDeleteAttribute = (id: string) => {
    deleteAttrMutation.mutate(id);
  };

  const attributeColumns = useCategoryAttributeColumns({ onDelete: handleDeleteAttribute });

  const attributeData = useMemo(() => selectedCategory?.attribute_definitions ?? [], [selectedCategory]);
  const attributesTable = useDataTable({
    columns: attributeColumns,
    data: attributeData,
    enableSorting: true,
    enableGlobalFilter: true,
    pageSize: 10,
    getRowId: (attr) => attr.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Tags className="w-7 h-7 text-app-accent" />
            إدارة قوالب الفئات والخصائص
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            تهيئة فئات الأصناف وتحديد الحقول الديناميكية المطلوبة (الضغط، الوزن، الكثافة، النقاء).
          </p>
        </div>

        <button
          onClick={() => setIsCatModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> إضافة فئة صنف
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="bg-app-bg-primary rounded-2xl border border-app-separator p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-app-accent" /> فئات المنتجات
          </h3>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-app-label-secondary">جاري تحميل الفئات…</div>
          ) : (
            <div className="space-y-2">
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
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {cat.item_type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-accent-subtle text-app-accent font-medium">
                          {ITEM_TYPE_LABELS[cat.item_type] ?? cat.item_type}
                        </span>
                      )}
                      <span className="text-[10px] text-app-label-tertiary">
                        {cat.attribute_definitions?.length || 0} خاصية ديناميكية معرّفة
                      </span>
                    </div>
                  </div>
                );
              })}
              {categories?.length === 0 && (
                <div className="p-6 text-center text-xs text-app-label-tertiary">لا توجد فئات بعد.</div>
              )}
            </div>
          )}
        </div>

        {/* Attribute Template Configurator */}
        <div className="lg:col-span-2 bg-app-bg-primary rounded-2xl border border-app-separator p-6 shadow-sm space-y-4">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between border-b border-app-separator pb-4">
                <div>
                  <h2 className="text-base font-bold text-app-label-primary">
                    قالب الخصائص: {selectedCategory.name}
                  </h2>
                  <p className="text-xs text-app-label-secondary">
                    تحديد حقول المواصفات المخصصة المطبّقة على الأصناف ودفعات المخزون المسلسلة.
                  </p>
                </div>
                <button
                  onClick={() => setIsAttrModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة حقل خاصية
                </button>
              </div>

              {/* Attribute Definitions Table */}
              <DataTable table={attributesTable}>
                <DataTable.Header>
                  <DataTable.Toolbar>
                    <DataTable.SearchInput placeholder="بحث في الخصائص..." />
                  </DataTable.Toolbar>
                </DataTable.Header>
                <DataTable.Content
                  emptyMessage="لا توجد حقول خصائص معرّفة لهذه الفئة بعد."
                  emptyIcon={Sliders}
                />
                <DataTable.Pagination />
              </DataTable>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-app-label-tertiary space-y-2">
              <Sliders className="w-8 h-8 text-app-label-tertiary" />
              <p className="text-xs">اختر فئة منتج من اللوحة الجانبية لتهيئة قالب خصائصها الديناميكية.</p>
            </div>
          )}
        </div>
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

      {/* Attribute Field Creation Modal */}
      <Dialog open={isAttrModalOpen && Boolean(selectedCategory)} onOpenChange={setIsAttrModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>إضافة خاصية إلى {selectedCategory?.name}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form id="attribute-create-form" onSubmit={handleCreateAttribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">اسم الحقل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تصنيف الضغط"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">معرف الحقل (Slug)</label>
                  <input
                    type="text"
                    placeholder="مثال: pressure_kpa"
                    value={attrSlug}
                    onChange={(e) => setAttrSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">نوع البيانات</label>
                  <select
                    value={attrDataType}
                    onChange={(e) => setAttrDataType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="number">رقم</option>
                    <option value="text">نص</option>
                    <option value="select">قائمة اختيار</option>
                    <option value="boolean">منطقي (نعم/لا)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">وحدة القياس (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: kPa, kg/m³, L, %"
                  value={attrUom}
                  onChange={(e) => setAttrUom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attrReq"
                  checked={attrRequired}
                  onChange={(e) => setAttrRequired(e.target.checked)}
                  className="rounded border-app-separator text-app-accent focus:ring-app-accent"
                />
                <label htmlFor="attrReq" className="text-xs font-medium text-app-label-primary">
                  مطلوب عند تسجيل دفعة مخزون
                </label>
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAttrModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="attribute-create-form"
              disabled={createAttrMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {createAttrMutation.isPending ? "جاري الإضافة…" : "حفظ حقل الخاصية"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
