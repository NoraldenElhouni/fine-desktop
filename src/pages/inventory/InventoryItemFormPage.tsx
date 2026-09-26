import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowRight, Calculator, Info, Layers, Package, Plus, Ruler } from "lucide-react";
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

/** One consistent card chrome for every field group on this form. */
const SectionCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="space-y-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
    <div className="flex items-center gap-2 text-xs font-bold text-app-label-primary">
      <Icon className="w-4 h-4 text-app-accent" />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

/** The small "here's what that means" confirmation banner, reused for both computed previews. */
const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-app-accent/10 border border-app-accent/20 text-xs text-app-accent">
    <Calculator className="w-4 h-4 shrink-0" />
    <span>{children}</span>
  </div>
);

const inputClass =
  "w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none";
const labelClass = "block text-xs font-semibold text-app-label-secondary mb-1";
const helperClass = "text-[11px] text-app-label-tertiary mt-1";

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
  const [lengthM, setLengthM] = useState("");
  const [widthM, setWidthM] = useState("");
  const [heightM, setHeightM] = useState("");
  const [error, setError] = useState<string | null>(null);

  // م³ items almost always have known dimensions; other UOMs rarely do, so
  // only auto-reveal the dimensions card for volumetric items — everything
  // else can still open it manually via the "إضافة مقاس" button.
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
    setLengthM(editingItem.length_m ? String(editingItem.length_m) : "");
    setWidthM(editingItem.width_m ? String(editingItem.width_m) : "");
    setHeightM(editingItem.height_m ? String(editingItem.height_m) : "");
    const hasDimensions = Boolean(editingItem.length_m || editingItem.width_m || editingItem.height_m);
    if (hasDimensions || editingItem.unit_of_measure === "m3") {
      setDimensionsVisible(true);
    }
  }, [isEdit, editingItem]);

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const categoryPrefix = selectedCategory?.code ?? "";
  const fullCode = `${categoryPrefix}${codeSegment.trim()}`;
  const containerUnitLabel = UOM_LABELS[secondaryUom] || secondaryUom || UOM_LABELS[uom] || uom;

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
      length_m: lengthM.trim() ? Number(lengthM) : null,
      width_m: widthM.trim() ? Number(widthM) : null,
      height_m: heightM.trim() ? Number(heightM) : null,
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

        <SectionCard icon={Info} title="بيانات الصنف">
          <div>
            <label className={labelClass}>الفئة</label>
            <SearchableSelect<{ id: string; name: string; code?: string }>
              options={categories ?? []}
              value={categories?.find((c) => c.id === categoryId) ?? null}
              onChange={(c) => handleCategoryChange(c ? c.id : "")}
              getOptionId={(c) => c.id}
              getOptionLabel={(c) => c.name}
              getOptionSubLabel={(c) => c.code}
              getOptionSearchText={(c) => `${c.name} ${c.code ?? ""}`}
              placeholder="اختر فئة الصنف"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>اسم الصنف</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>رمز الصنف</label>
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
                  className={`${inputClass} font-mono`}
                  dir="ltr"
                />
              </div>
              {categoryPrefix && codeSegment.trim() && (
                <p className={helperClass}>
                  الرمز الكامل:{" "}
                  <span className="font-mono font-bold text-app-accent" dir="ltr">
                    {fullCode}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-app-label-secondary">نوع الصنف</label>
              {categories?.find((c) => c.id === categoryId)?.item_type && (
                <span className="text-[10px] text-app-accent font-medium">تلقائي من الفئة</span>
              )}
            </div>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as InventoryItem["item_type"])}
              className={inputClass}
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
        </SectionCard>

        <SectionCard icon={Layers} title="وحدات القياس والتعبئة">
          <div>
            <label className={labelClass}>الوحدة الأساسية</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)} className={inputClass}>
              <option value="kg">كجم (كيلوغرام)</option>
              <option value="liter">لتر</option>
              <option value="m3">م³ (متر مكعب)</option>
              <option value="meter">متر</option>
              <option value="each">قطعة / وحدة</option>
            </select>
            <p className={helperClass}>تُستخدم لحساب الكميات وتكلفة المخزون في النظام.</p>
          </div>

          <div className="pt-3 border-t border-app-separator space-y-3">
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
                  الصنف يُخزَّن في حاويات
                </span>
                <span className={helperClass + " block"}>
                  فعّل هذا إذا كان الصنف يُورَّد أو يُخزَّن في حاويات بسعة ثابتة، مثل براميل أو صناديق أو أكياس.
                </span>
              </div>
            </label>

            {hasContainerTracking && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>وحدة الحاوية</label>
                    <input
                      type="text"
                      placeholder="مثال: برميل, صندوق, طرد"
                      value={primaryUom}
                      onChange={(e) => setPrimaryUom(e.target.value)}
                      className={inputClass}
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
                              : "bg-app-bg-primary border-app-separator text-app-label-secondary hover:text-app-label-primary"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>سعة الحاوية الواحدة ({containerUnitLabel})</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="مثال: 200"
                      value={containerCapacity}
                      onChange={(e) => setContainerCapacity(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>الوحدة الداخلية</label>
                  <input
                    type="text"
                    placeholder={UOM_LABELS[uom] || uom}
                    value={secondaryUom}
                    onChange={(e) => setSecondaryUom(e.target.value)}
                    className={inputClass}
                  />
                  <p className={helperClass}>الوحدة التي تُقاس بها محتويات الحاوية. الافتراضي: نفس الوحدة الأساسية.</p>
                </div>

                {Number(containerCapacity) > 0 && primaryUom && (
                  <Callout>
                    كل 1 {primaryUom} ={" "}
                    <strong className="font-bold font-mono">
                      {formatNumber(Number(containerCapacity))} {containerUnitLabel}
                    </strong>
                  </Callout>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {dimensionsVisible ? (
          <SectionCard icon={Ruler} title="المقاس">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>الطول (م)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 1.00"
                  value={lengthM}
                  onChange={(e) => setLengthM(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>العرض (م)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 2.00"
                  value={widthM}
                  onChange={(e) => setWidthM(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>الارتفاع (م)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="مثال: 2.40"
                  value={heightM}
                  onChange={(e) => setHeightM(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            {Number(lengthM) > 0 && Number(widthM) > 0 && Number(heightM) > 0 && (
              <Callout>
                الحجم ={" "}
                <strong className="font-bold font-mono">
                  {formatNumber(Number(lengthM) * Number(widthM) * Number(heightM))} م³
                </strong>
              </Callout>
            )}
          </SectionCard>
        ) : (
          <button
            type="button"
            onClick={() => setDimensionsVisible(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-app-accent hover:underline w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مقاس
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
