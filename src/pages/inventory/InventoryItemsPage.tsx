import React, { useMemo, useState } from "react";
import {
  useInventoryItems,
  useCreateInventoryItem,
  useUpdateInventoryItem,
} from "../../hooks/useInventory";
import {
  useItemCategories,
  useAttributeLibrary,
} from "../../hooks/useCategories";
import { Package, Plus, Search, Filter, Sliders, Layers, Calculator } from "lucide-react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useInventoryItemsColumns } from "../../components/table-columns/inventoryItemsColumns";
import { type InventoryItem, UOM_LABELS } from "../../api/endpoints/inventory";
import { toast } from "../../stores/toastStore";
import { formatNumber } from "../../lib/utils/format";
import { isAxiosError } from "axios";

export const InventoryItemsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemType, setItemType] = useState<InventoryItem["item_type"]>("raw_material");
  const [uom, setUom] = useState<InventoryItem["unit_of_measure"]>("kg");
  const [hasContainerTracking, setHasContainerTracking] = useState(false);
  const [primaryUom, setPrimaryUom] = useState("");
  const [containerCapacity, setContainerCapacity] = useState("");
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    [],
  );

  const { data: itemData, isLoading } = useInventoryItems({
    search: searchTerm || undefined,
    item_type: typeFilter || undefined,
    category_id: categoryFilter || undefined,
  });

  const { data: categories } = useItemCategories();
  const { data: attributeLibrary } = useAttributeLibrary();
  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();

  const toggleAttribute = (id: string) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Nothing to assign until a category is picked; then show attributes scoped
  // to it plus any with no category (the global library, which applies everywhere).
  const filteredAttributes = useMemo(() => {
    if (!attributeLibrary || !categoryId) return [];
    return attributeLibrary.filter(
      (attr) => !attr.category_id || attr.category_id === categoryId,
    );
  }, [attributeLibrary, categoryId]);

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);

    // Dynamically populate itemType if the selected category defines an item_type
    const matchedCategory = categories?.find((c) => c.id === nextCategoryId);
    if (matchedCategory?.item_type) {
      setItemType(matchedCategory.item_type as InventoryItem["item_type"]);
    }

    // Drop any already-picked attribute that no longer applies under the new category.
    setSelectedAttributeIds((prev) =>
      prev.filter((id) => {
        const attr = attributeLibrary?.find((a) => a.id === id);
        return (
          !attr || !attr.category_id || attr.category_id === nextCategoryId
        );
      }),
    );
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingItem(null);
    setName("");
    setSku("");
    setCategoryId("");
    setItemType("raw_material");
    setUom("kg");
    setHasContainerTracking(false);
    setPrimaryUom("");
    setContainerCapacity("");
    setSelectedAttributeIds([]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setModalMode("edit");
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setCategoryId(item.category_id ?? "");
    setItemType(item.item_type);
    setUom(item.unit_of_measure || "kg");
    const hasContainers = Boolean(item.container_capacity && Number(item.container_capacity) > 0) || Boolean(item.primary_uom);
    setHasContainerTracking(hasContainers);
    setPrimaryUom(item.primary_uom ?? "");
    setContainerCapacity(item.container_capacity ? String(item.container_capacity) : "");
    setSelectedAttributeIds(item.attribute_definitions?.map((a) => a.id) ?? []);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedCapacity = containerCapacity.trim() ? Number(containerCapacity) : null;
    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category_id: categoryId || undefined,
      item_type: itemType,
      unit_of_measure: uom,
      primary_uom: hasContainerTracking ? (primaryUom.trim() || undefined) : null,
      secondary_uom: hasContainerTracking ? uom : null,
      container_capacity: hasContainerTracking && parsedCapacity && parsedCapacity > 0 ? parsedCapacity : null,
      attribute_definition_ids: selectedAttributeIds,
    };

    try {
      if (modalMode === "create") {
        await createItemMutation.mutateAsync(payload);
        toast.success("تم إنشاء صنف المخزون بنجاح");
      } else if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          data: payload,
        });
        toast.success("تم تحديث صنف المخزون بنجاح");
      }
      setIsModalOpen(false);
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
        setError(err.response?.data?.message ?? "فشل حفظ صنف المخزون");
      } else {
        setError("فشل حفظ صنف المخزون");
      }
    }
  };

  const columns = useInventoryItemsColumns({ onEdit: openEditModal });

  const tableData = useMemo(() => itemData?.data ?? [], [itemData]);
  const itemsTable = useDataTable({
    columns,
    data: tableData,
    enableSorting: true,
    enableGlobalFilter: false,
    pageSize: 10,
    getRowId: (item) => item.id,
  });

  const isSubmitting =
    createItemMutation.isPending || updateItemMutation.isPending;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Package className="w-7 h-7 text-app-accent" />
            سجل الأصناف الرئيسي
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كتالوج المواد الخام وقوالب الإسفنج والقطع المشذبة والشرائح والأصناف
            القابلة للبيع، مع تعيينات الخصائص المخصصة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
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
            aria-label="بحث في الأصناف"
            placeholder="بحث برمز الصنف (SKU) أو الاسم…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-9 pe-4 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary placeholder-app-label-tertiary focus:border-app-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-app-label-secondary" />
          <span className="text-xs font-semibold text-app-label-secondary">
            الفئة:
          </span>
          <div className="min-w-[12rem]">
            <SearchableSelect<{ id: string; name: string }>
              options={categories ?? []}
              value={categories?.find((c) => c.id === categoryFilter) ?? null}
              onChange={(c) => setCategoryFilter(c ? c.id : "")}
              getOptionId={(c) => c.id}
              getOptionLabel={(c) => c.name}
              placeholder="كل الفئات"
              size="sm"
            />
          </div>

          <span className="text-xs font-semibold text-app-label-secondary">
            النوع:
          </span>
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
            <DialogTitle>
              {modalMode === "create"
                ? "إنشاء صنف مخزون"
                : `تعديل الصنف: ${editingItem?.name ?? ""}`}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form
              id="inventory-item-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <div className="rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2.5 text-xs text-app-status-danger">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                  فئة الصنف
                </label>
                <SearchableSelect<{ id: string; name: string; code?: string }>
                  options={categories ?? []}
                  value={categories?.find((c) => c.id === categoryId) ?? null}
                  onChange={(c) => handleCategoryChange(c ? c.id : "")}
                  getOptionId={(c) => c.id}
                  getOptionLabel={(c) => c.name}
                  getOptionSubLabel={(c) => c.code}
                  getOptionSearchText={(c) => `${c.name} ${c.code ?? ""}`}
                  placeholder="اختر قالب فئة المنتج"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    اسم الصنف
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    رمز الصنف (SKU)
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase">
                    نوع الصنف
                  </label>
                  {categories?.find((c) => c.id === categoryId)?.item_type && (
                    <span className="text-[10px] text-app-accent font-medium">
                      تلقائي من الفئة
                    </span>
                  )}
                </div>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as InventoryItem["item_type"])}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                >
                  <option value="raw_material">مادة خام</option>
                  <option value="foam_block">قالب إسفنج</option>
                  <option value="cut_template_piece">قطعة قالب تشذيب</option>
                  <option value="slice">شريحة</option>
                  <option value="byproduct_fill">حشو ثانوي</option>
                  <option value="furniture_finished_good">
                    منتج أثاث تام
                  </option>
                  <option value="barrel">برميل</option>
                  <option value="pallet">منصة نقالة</option>
                  <option value="packaging">تغليف</option>
                </select>
              </div>

              {/* Units of Measure & Packaging Section */}
              <div className="space-y-3 p-3.5 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-app-label-primary">
                  <Layers className="w-4 h-4 text-app-accent" />
                  <span>وحدات القياس والتعبئة (Units of Measure & Packaging)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    وحدة القياس الأساسية (Base UOM)
                  </label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="kg">كجم (كيلوغرام)</option>
                    <option value="liter">لتر</option>
                    <option value="m3">م³ (متر مكعب)</option>
                    <option value="meter">متر</option>
                    <option value="each">قطعة / وحدة</option>
                  </select>
                  <p className="text-[11px] text-app-label-tertiary mt-1">
                    الوحدة المعيارية لاحتساب الكميات وتكلفة المخزون في النظام.
                  </p>
                </div>

                <div className="pt-2 border-t border-app-separator">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasContainerTracking}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasContainerTracking(checked);
                        if (!checked) {
                          setPrimaryUom("");
                          setContainerCapacity("");
                        }
                      }}
                      className="mt-0.5 rounded border-app-separator text-app-accent focus:ring-app-accent"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-app-label-primary block">
                        تتبع الحاويات والتعبئة (Container & Packaging Tracking)
                      </span>
                      <span className="text-[11px] text-app-label-secondary block mt-0.5">
                        فعل هذا الخيار إذا كان الصنف يتم توريده أو تخزينه في حاويات أو طرود (مثل براميل، كراتين، منصات) تحتوي على سعة ثابتة من وحدة القياس الأساسية.
                      </span>
                    </div>
                  </label>

                  {hasContainerTracking && (
                    <div className="mt-3 p-3 rounded-xl bg-app-bg-primary border border-app-separator space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                            وحدة التعبئة / الحاوية
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: برميل, صندوق, طرد, منصة"
                            value={primaryUom}
                            onChange={(e) => setPrimaryUom(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {["برميل", "صندوق", "طرد", "منصة نقالة", "كيس", "رول"].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPrimaryUom(preset)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                  primaryUom === preset
                                    ? "bg-app-accent text-white border-app-accent"
                                    : "bg-app-bg-secondary border-app-separator text-app-label-secondary hover:text-app-label-primary"
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                            سعة الحاوية الواحدة (من {UOM_LABELS[uom] || uom})
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="مثال: 200"
                            value={containerCapacity}
                            onChange={(e) => setContainerCapacity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                          />
                          <p className="text-[10px] text-app-label-tertiary mt-1">
                            كم {UOM_LABELS[uom] || uom} يحوي كل {primaryUom || "حاوية واحدة"}
                          </p>
                        </div>
                      </div>

                      {Number(containerCapacity) > 0 && primaryUom && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-app-accent/10 border border-app-accent/20 text-xs text-app-accent">
                          <Calculator className="w-4 h-4 shrink-0" />
                          <span>
                            كل 1 {primaryUom} ={" "}
                            <strong className="font-bold font-mono">
                              {formatNumber(Number(containerCapacity))} {UOM_LABELS[uom] || uom}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Attributes Many-to-Many Assignment */}
              <div className="space-y-2 p-3 bg-app-bg-secondary rounded-xl border border-app-separator">
                <label className="text-xs font-semibold text-app-label-primary uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-app-accent" /> إسناد
                  خصائص المنتج
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {filteredAttributes.map((attr) => {
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
                          {attr.name}{" "}
                          {attr.unit_of_measure
                            ? `(${attr.unit_of_measure})`
                            : ""}
                        </span>
                      </label>
                    );
                  })}
                  {filteredAttributes.length === 0 && (
                    <div className="col-span-2 text-xs text-app-label-tertiary text-center py-2">
                      {categoryId
                        ? "لا توجد خصائص معرّفة لهذه الفئة بعد. أضفها من إدارة قوالب الفئات والخصائص."
                        : "اختر فئة الصنف أولاً لعرض خصائصها."}
                    </div>
                  )}
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting
                ? "جاري الحفظ…"
                : modalMode === "create"
                  ? "حفظ الصنف"
                  : "تحديث الصنف"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
