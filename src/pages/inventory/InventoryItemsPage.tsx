import React, { useMemo, useState } from "react";
import { useInventoryItems, useCreateInventoryItem } from "../../hooks/useInventory";
import { useItemCategories, useAttributeLibrary } from "../../hooks/useCategories";
import { Package, PackagePlus, Plus, Search, Filter, Sliders } from "lucide-react";
import { StockIntakeModal } from "./StockIntakeModal";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useInventoryItemsColumns } from "../../components/table-columns/inventoryItemsColumns";

export const InventoryItemsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemType, setItemType] = useState<any>("raw_material");
  const [uom, setUom] = useState<any>("kg");
  const [primaryUom, setPrimaryUom] = useState("barrel");
  const [secondaryUom, setSecondaryUom] = useState("liter");
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);

  const { data: itemData, isLoading } = useInventoryItems({
    search: searchTerm || undefined,
    item_type: typeFilter || undefined,
    category_id: categoryFilter || undefined,
  });

  const { data: categories } = useItemCategories();
  const { data: attributeLibrary } = useAttributeLibrary();
  const createItemMutation = useCreateInventoryItem();

  const toggleAttribute = (id: string) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createItemMutation.mutate(
      {
        name,
        sku,
        category_id: categoryId || undefined,
        item_type: itemType,
        unit_of_measure: uom,
        primary_uom: primaryUom,
        secondary_uom: secondaryUom,
        attribute_definition_ids: selectedAttributeIds,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setName("");
          setSku("");
          setSelectedAttributeIds([]);
        },
      }
    );
  };

  const columns = useInventoryItemsColumns();

  const tableData = useMemo(() => itemData?.data ?? [], [itemData]);
  const itemsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (item) => item.id,
  });

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Package className="w-7 h-7 text-app-accent" />
            سجل الأصناف الرئيسي
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كتالوج المواد الخام وقوالب الإسفنج والقطع المشذبة والشرائح والأصناف القابلة للبيع، مع تعيينات الخصائص المخصصة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-app-accent px-4 py-2 text-xs font-bold text-app-accent hover:bg-app-accent-subtle transition-all active:scale-95"
          >
            <PackagePlus className="w-4 h-4" /> استلام مخزون
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> إضافة صنف مخزون
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3 top-3 text-app-label-tertiary" />
          <input
            type="text"
            placeholder="بحث برمز الصنف (SKU) أو الاسم…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary placeholder-app-label-tertiary focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-app-label-secondary" />
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          >
            <option value="">كل أنواع الأصناف</option>
            <option value="raw_material">مادة خام</option>
            <option value="foam_block">قالب إسفنج</option>
            <option value="cut_template_piece">قطعة قالب تشذيب</option>
            <option value="slice">شريحة</option>
            <option value="byproduct_fill">حشو ثانوي</option>
            <option value="furniture_finished_good">منتج أثاث تام</option>
            <option value="barrel">برميل</option>
            <option value="pallet">منصة نقالة</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <DataTable table={itemsTable}>
        <DataTable.Content
          isLoading={isLoading}
          emptyMessage="لا توجد أصناف مخزون."
          emptyIcon={Package}
        />
        <DataTable.Pagination />
      </DataTable>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>إنشاء صنف مخزون</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form id="inventory-item-form" onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">فئة الصنف</label>
                <SearchableSelect<{ id: string; name: string; code?: string }>
                  options={categories ?? []}
                  value={
                    categories?.find((c) => c.id === categoryId) ?? null
                  }
                  onChange={(c) => setCategoryId(c ? c.id : "")}
                  getOptionId={(c) => c.id}
                  getOptionLabel={(c) => c.name}
                  getOptionSubLabel={(c) => c.code}
                  getOptionSearchText={(c) => `${c.name} ${c.code ?? ""}`}
                  placeholder="اختر قالب فئة المنتج"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">اسم الصنف</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">رمز الصنف (SKU)</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">نوع الصنف</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
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
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">وحدة القياس الأساسية</label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="each">وحدة</option>
                    <option value="m3">م³</option>
                    <option value="kg">كجم</option>
                    <option value="meter">متر</option>
                    <option value="liter">لتر</option>
                  </select>
                </div>
              </div>

              {/* Product Attributes Many-to-Many Assignment */}
              <div className="space-y-2 p-3 bg-app-bg-secondary rounded-xl border border-app-separator">
                <label className="block text-xs font-semibold text-app-label-primary uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-app-accent" /> إسناد خصائص المنتج
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {attributeLibrary?.map((attr) => {
                    const isChecked = selectedAttributeIds.includes(attr.id);
                    return (
                      <label
                        key={attr.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "border-app-accent bg-app-accent-subtle text-app-accent font-bold"
                            : "border-app-separator bg-app-bg-primary text-app-label-primary"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAttribute(attr.id)}
                          className="rounded border-app-separator text-app-accent focus:ring-app-accent"
                        />
                        <span className="truncate">
                          {attr.name} {attr.unit_of_measure ? `(${attr.unit_of_measure})` : ""}
                        </span>
                      </label>
                    );
                  })}
                  {attributeLibrary?.length === 0 && (
                    <div className="col-span-2 text-xs text-app-label-tertiary text-center py-2">
                      لا توجد خصائص رئيسية متاحة. أضفها من مكتبة الخصائص.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">وحدة الحاوية</label>
                  <input
                    type="text"
                    placeholder="مثال: barrel, block"
                    value={primaryUom}
                    onChange={(e) => setPrimaryUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">وحدة القياس</label>
                  <input
                    type="text"
                    placeholder="مثال: liter, m3, kg"
                    value={secondaryUom}
                    onChange={(e) => setSecondaryUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="inventory-item-form"
              disabled={createItemMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {createItemMutation.isPending ? "جاري الحفظ…" : "حفظ الصنف"}
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
