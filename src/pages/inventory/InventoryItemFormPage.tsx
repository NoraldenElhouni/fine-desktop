import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowRight, Calculator, Layers, Package, Plus, Ruler } from "lucide-react";
import {
  useCreateInventoryItem,
  useInventoryItem,
  useUpdateInventoryItem,
} from "../../hooks/useInventory";
import { useItemCategories } from "../../hooks/useCategories";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { type InventoryItem, UOM_LABELS } from "../../api/endpoints/inventory";
import { toast } from "../../stores/toastStore";
import { formatNumber } from "../../lib/utils/format";

const InventoryItemFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: editingItem, isLoading: isLoadingItem } = useInventoryItem(id);
  const { data: categories } = useItemCategories();
  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();

  const [name, setName] = useState("");
  const [codeSegment, setCodeSegment] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemType, setItemType] = useState<InventoryItem["item_type"]>("raw_material");
  const [uom, setUom] = useState<InventoryItem["unit_of_measure"]>("kg");
  const [hasContainerTracking, setHasContainerTracking] = useState(false);
  const [primaryUom, setPrimaryUom] = useState("");
  const [secondaryUom, setSecondaryUom] = useState("");
  const [containerCapacity, setContainerCapacity] = useState("");
  const [dimensionsVisible, setDimensionsVisible] = useState(false);
  const [nominalLength, setNominalLength] = useState("");
  const [nominalWidth, setNominalWidth] = useState("");
  const [nominalHeight, setNominalHeight] = useState("");
  const [error, setError] = useState<string | null>(null);

  // م³ items almost always carry a spec size; other UOMs rarely do, so only
  // auto-reveal the dimensions card for volumetric items — everything else
  // can still open it manually via the "إضافة مقاس اسمي" button.
  useEffect(() => {
    if (uom === "m3") {
      setDimensionsVisible(true);
    }
  }, [uom]);

  useEffect(() => {
    if (!isEdit || !editingItem) return;
    setName(editingItem.name);
    // The category prefix is derived, not stored — strip it back off so the
    // input only ever holds the part the user actually typed.
    const categoryPrefix = editingItem.category?.code ?? "";
    setCodeSegment(
      categoryPrefix && editingItem.code.startsWith(categoryPrefix)
        ? editingItem.code.slice(categoryPrefix.length)
        : editingItem.code,
    );
    setCategoryId(editingItem.category_id ?? "");
    setItemType(editingItem.item_type);
    setUom(editingItem.unit_of_measure || "kg");
    const hasContainers =
      Boolean(editingItem.container_capacity && Number(editingItem.container_capacity) > 0) ||
      Boolean(editingItem.primary_uom);
    setHasContainerTracking(hasContainers);
    setPrimaryUom(editingItem.primary_uom ?? "");
    setSecondaryUom(editingItem.secondary_uom ?? "");
    setContainerCapacity(editingItem.container_capacity ? String(editingItem.container_capacity) : "");
    setNominalLength(editingItem.nominal_length_m ? String(editingItem.nominal_length_m) : "");
    setNominalWidth(editingItem.nominal_width_m ? String(editingItem.nominal_width_m) : "");
    setNominalHeight(editingItem.nominal_height_m ? String(editingItem.nominal_height_m) : "");
    const hasDimensions = Boolean(
      editingItem.nominal_length_m || editingItem.nominal_width_m || editingItem.nominal_height_m,
    );
    if (hasDimensions || editingItem.unit_of_measure === "m3") {
      setDimensionsVisible(true);
    }
  }, [isEdit, editingItem]);

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const categoryPrefix = selectedCategory?.code ?? "";
  const fullCode = `${categoryPrefix}${codeSegment.trim()}`;

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);

    // Dynamically populate itemType if the selected category defines an item_type
    const matchedCategory = categories?.find((c) => c.id === nextCategoryId);
    if (matchedCategory?.item_type) {
      setItemType(matchedCategory.item_type as InventoryItem["item_type"]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedCapacity = containerCapacity.trim() ? Number(containerCapacity) : null;
    const payload = {
      name: name.trim(),
      code: fullCode,
      category_id: categoryId || undefined,
      item_type: itemType,
      unit_of_measure: uom,
      primary_uom: hasContainerTracking ? (primaryUom.trim() || undefined) : null,
      secondary_uom: hasContainerTracking ? (secondaryUom.trim() || uom) : null,
      container_capacity: hasContainerTracking && parsedCapacity && parsedCapacity > 0 ? parsedCapacity : null,
      nominal_length_m: nominalLength.trim() ? Number(nominalLength) : null,
      nominal_width_m: nominalWidth.trim() ? Number(nominalWidth) : null,
      nominal_height_m: nominalHeight.trim() ? Number(nominalHeight) : null,
    };

    try {
      if (isEdit && id) {
        await updateItemMutation.mutateAsync({ id, data: payload });
        toast.success("تم تحديث صنف المخزون بنجاح");
      } else {
        await createItemMutation.mutateAsync(payload);
        toast.success("تم إنشاء صنف المخزون بنجاح");
      }
      navigate("/settings/products/items");
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

  const isSubmitting = createItemMutation.isPending || updateItemMutation.isPending;

  if (isEdit && isLoadingItem) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-app-label-secondary">
        جارٍ تحميل بيانات الصنف…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Link
        to="/settings/products/items"
        className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline w-fit"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الأصناف
      </Link>

      <h1 className="text-xl font-bold text-app-label-primary flex items-center gap-2">
        <Package className="w-6 h-6 text-app-accent" />
        {isEdit ? `تعديل الصنف: ${editingItem?.name ?? ""}` : "إنشاء صنف مخزون"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
              رمز الصنف
            </label>
            <div className="flex items-center gap-1.5">
              {categoryPrefix && (
                <span
                  className="shrink-0 rounded-lg bg-app-fill-f1 px-2.5 py-2 text-xs font-mono font-bold text-app-label-secondary"
                  dir="ltr"
                >
                  {categoryPrefix}
                </span>
              )}
              <input
                type="text"
                required
                placeholder={categoryPrefix ? "مثال: 01" : "الرمز الكامل"}
                value={codeSegment}
                onChange={(e) => setCodeSegment(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                dir="ltr"
              />
            </div>
            {categoryPrefix && codeSegment.trim() && (
              <p className="text-[11px] text-app-label-tertiary mt-1">
                الرمز الكامل سيكون:{" "}
                <span className="font-mono font-bold text-app-accent" dir="ltr">
                  {fullCode}
                </span>
              </p>
            )}
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
            <option value="furniture_finished_good">منتج أثاث تام</option>
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
                  if (checked && !secondaryUom) {
                    setSecondaryUom(uom);
                  }
                  if (!checked) {
                    setPrimaryUom("");
                    setSecondaryUom("");
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
                      الوحدة الأولى (وحدة التعبئة / الحاوية)
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
                      الوحدة الثانية (الوحدة الأساسية داخل الحاوية)
                    </label>
                    <input
                      type="text"
                      placeholder={UOM_LABELS[uom] || uom}
                      value={secondaryUom}
                      onChange={(e) => setSecondaryUom(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                    />
                    <p className="text-[10px] text-app-label-tertiary mt-1">
                      افتراضياً نفس الوحدة الأساسية ({UOM_LABELS[uom] || uom})، وتقدر تغيرها.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    سعة الحاوية الواحدة (من {UOM_LABELS[secondaryUom] || secondaryUom || UOM_LABELS[uom] || uom})
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
                    كم {UOM_LABELS[secondaryUom] || secondaryUom || UOM_LABELS[uom] || uom} يحوي كل {primaryUom || "حاوية واحدة"}
                  </p>
                </div>

                {Number(containerCapacity) > 0 && primaryUom && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-app-accent/10 border border-app-accent/20 text-xs text-app-accent">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span>
                      كل 1 {primaryUom} ={" "}
                      <strong className="font-bold font-mono">
                        {formatNumber(Number(containerCapacity))} {UOM_LABELS[secondaryUom] || secondaryUom || UOM_LABELS[uom] || uom}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nominal Dimensions Section */}
        {dimensionsVisible ? (
          <div className="space-y-3 p-3.5 bg-app-bg-secondary rounded-xl border border-app-separator">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-app-label-primary">
              <Ruler className="w-4 h-4 text-app-accent" />
              <span>المقاس الاسمي (Nominal Dimensions)</span>
            </div>
            <p className="text-[11px] text-app-label-tertiary -mt-2">
              المقاس المرجعي لهذا الصنف حسب الكتالوج، وليس القياس الفعلي لدفعة معينة (يُسجَّل لكل دفعة على حدة).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الطول (م)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 1.00"
                  value={nominalLength}
                  onChange={(e) => setNominalLength(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  العرض (م)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 2.00"
                  value={nominalWidth}
                  onChange={(e) => setNominalWidth(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الارتفاع (م)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 2.40"
                  value={nominalHeight}
                  onChange={(e) => setNominalHeight(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>
            </div>

            {Number(nominalLength) > 0 && Number(nominalWidth) > 0 && Number(nominalHeight) > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-app-accent/10 border border-app-accent/20 text-xs text-app-accent">
                <Calculator className="w-4 h-4 shrink-0" />
                <span>
                  الحجم الاسمي ={" "}
                  <strong className="font-bold font-mono">
                    {formatNumber(Number(nominalLength) * Number(nominalWidth) * Number(nominalHeight))} م³
                  </strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDimensionsVisible(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-app-accent hover:underline w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مقاس اسمي (الطول × العرض × الارتفاع)
          </button>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "جاري الحفظ…" : isEdit ? "تحديث الصنف" : "حفظ الصنف"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings/products/items")}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryItemFormPage;
