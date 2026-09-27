import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Package, Plus, X } from "lucide-react";
import {
  useCreateInventoryItem,
  useInventoryItem,
  useUpdateInventoryItem,
} from "../../hooks/useInventory";
import { useItemCategories } from "../../hooks/useCategories";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  Field,
  GuidedFormLoading,
  GuidedFormPage,
  Question,
  SummaryRow,
  formInputClass as inputClass,
} from "../../components/ui/GuidedForm";
import {
  type InventoryItem,
  type PriceBasis,
  PRICE_BASIS_LABELS,
  UOM_LABELS,
} from "../../api/endpoints/inventory";
import {
  ITEM_TYPE_LABELS,
  type InventoryItemType,
} from "../../api/endpoints/categories";
import { toast } from "../../stores/toastStore";
import { formatNumber } from "../../lib/utils/format";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const type = tokens.typography.webUI;

const UNIT_CHOICES: { value: string; label: string; hint: string }[] = [
  { value: "kg", label: "كيلوغرام", hint: "مواد تُوزن" },
  { value: "liter", label: "لتر", hint: "سوائل" },
  { value: "m3", label: "متر مكعب", hint: "قوالب إسفنج" },
  { value: "meter", label: "متر", hint: "أقمشة ولفّات" },
  { value: "each", label: "قطعة", hint: "تُعدّ بالعدد" },
];

const PACKAGE_PRESETS = ["برميل", "صندوق", "كيس", "رول", "طرد", "منصة"];

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
  const [itemType, setItemType] =
    useState<InventoryItem["item_type"]>("raw_material");
  const [uom, setUom] = useState<InventoryItem["unit_of_measure"]>("kg");
  const [isPackaged, setIsPackaged] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [showSize, setShowSize] = useState(false);
  const [lengthM, setLengthM] = useState("");
  const [widthM, setWidthM] = useState("");
  const [heightM, setHeightM] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [priceBasis, setPriceBasis] = useState<PriceBasis>("unit");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uom === "m3") setShowSize(true);
  }, [uom]);

  useEffect(() => {
    if (!isEdit || !editingItem) return;
    setName(editingItem.name);
    const prefix = editingItem.category?.code ?? "";
    setCodeSegment(
      prefix && editingItem.code.startsWith(prefix)
        ? editingItem.code.slice(prefix.length)
        : editingItem.code,
    );
    setCategoryId(editingItem.category_id ?? "");
    setItemType(editingItem.item_type);
    setUom(editingItem.unit_of_measure || "kg");
    setIsPackaged(
      Number(editingItem.container_capacity) > 0 ||
        Boolean(editingItem.primary_uom),
    );
    setPackageName(editingItem.primary_uom ?? "");
    setCapacity(
      editingItem.container_capacity
        ? String(editingItem.container_capacity)
        : "",
    );
    setLengthM(editingItem.length_m ? String(editingItem.length_m) : "");
    setWidthM(editingItem.width_m ? String(editingItem.width_m) : "");
    setHeightM(editingItem.height_m ? String(editingItem.height_m) : "");
    setSellingPrice(
      editingItem.selling_price !== null && editingItem.selling_price !== undefined
        ? String(Number(editingItem.selling_price))
        : "",
    );
    setPriceBasis(editingItem.price_basis ?? "unit");
    if (
      editingItem.length_m ||
      editingItem.width_m ||
      editingItem.height_m ||
      editingItem.unit_of_measure === "m3"
    ) {
      setShowSize(true);
    }
  }, [isEdit, editingItem]);

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const categoryPrefix = selectedCategory?.code ?? "";
  const fullCode = `${categoryPrefix}${codeSegment.trim()}`;
  const typeFromCategory = Boolean(selectedCategory?.item_type);
  const unitLabel = UOM_LABELS[uom] || uom;
  const capacityNumber = Number(capacity);
  const volume = Number(lengthM) * Number(widthM) * Number(heightM);

  const handleCategoryChange = (nextId: string) => {
    setCategoryId(nextId);
    const matched = categories?.find((c) => c.id === nextId);
    if (matched?.item_type)
      setItemType(matched.item_type as InventoryItem["item_type"]);
  };

  const clearSize = () => {
    setLengthM("");
    setWidthM("");
    setHeightM("");
    setShowSize(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      code: fullCode,
      category_id: categoryId || undefined,
      item_type: itemType,
      unit_of_measure: uom,
      primary_uom: isPackaged ? packageName.trim() || null : null,
      secondary_uom: isPackaged ? uom : null,
      container_capacity:
        isPackaged && capacityNumber > 0 ? capacityNumber : null,
      length_m: lengthM.trim() ? Number(lengthM) : null,
      width_m: widthM.trim() ? Number(widthM) : null,
      height_m: heightM.trim() ? Number(heightM) : null,
      selling_price: sellingPrice.trim() ? Number(sellingPrice) : null,
      price_basis: priceBasis,
    };

    try {
      if (isEdit && id) {
        await updateItemMutation.mutateAsync({ id, data: payload });
        toast.success("تم حفظ التعديلات");
      } else {
        await createItemMutation.mutateAsync(payload);
        toast.success("تمت إضافة الصنف");
      }
      navigate("/settings/products/items");
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
        setError(err.response?.data?.message ?? "تعذّر حفظ الصنف");
      } else {
        setError("تعذّر حفظ الصنف");
      }
    }
  };

  const isSubmitting =
    createItemMutation.isPending || updateItemMutation.isPending;

  if (isEdit && isLoadingItem) {
    return <GuidedFormLoading>جارٍ تحميل الصنف…</GuidedFormLoading>;
  }

  return (
    <GuidedFormPage
      backTo="/settings/products/items"
      backLabel="الأصناف"
      title={isEdit ? `تعديل: ${editingItem?.name ?? ""}` : "صنف جديد"}
      error={error}
      onSubmit={handleSubmit}
      summaryIcon={Package}
      summaryTitle={name}
      summaryPlaceholder="صنف بدون اسم"
      summarySubtitle={fullCode}
      summary={
        <>
          <SummaryRow label="التصنيف">
            {selectedCategory?.name ?? "—"}
          </SummaryRow>
          <SummaryRow label="النوع">
            {ITEM_TYPE_LABELS[itemType as InventoryItemType] ?? itemType}
          </SummaryRow>
          <SummaryRow label="يُحسب بـ">{unitLabel}</SummaryRow>
          <SummaryRow label="التوريد">
            {isPackaged ? (
              packageName.trim() && capacityNumber > 0 ? (
                <>
                  {packageName.trim()} ={" "}
                  <span className="font-mono">
                    {formatNumber(capacityNumber)}
                  </span>{" "}
                  {unitLabel}
                </>
              ) : (
                <span className="text-app-label-tertiary">
                  في عبوات — أكمل البيانات
                </span>
              )
            ) : (
              "سائب"
            )}
          </SummaryRow>
          <SummaryRow label="سعر البيع">
            {sellingPrice.trim() ? (
              <>
                <span className="font-mono">
                  {formatNumber(Number(sellingPrice))}
                </span>{" "}
                د.ل {PRICE_BASIS_LABELS[priceBasis]}
              </>
            ) : (
              <span className="text-app-label-tertiary">يُحدد عند البيع</span>
            )}
          </SummaryRow>
          {volume > 0 && (
            <SummaryRow label="المقاس">
              <span className="font-mono" dir="ltr">
                {lengthM} × {widthM} × {heightM} م
              </span>
            </SummaryRow>
          )}
        </>
      }
      submitLabel={isEdit ? "حفظ التعديلات" : "حفظ الصنف"}
      isSubmitting={isSubmitting}
      onCancel={() => navigate("/settings/products/items")}
    >
      <Question number="1" title="ما هو الصنف؟">
        <Field label="اسم الصنف">
          <input
            type="text"
            required
            placeholder="مثال: كحول صناعي"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="التصنيف" hint="يحدد بداية الرمز ونوع الصنف تلقائياً">
            <SearchableSelect<{ id: string; name: string; code?: string }>
              options={categories ?? []}
              value={selectedCategory ?? null}
              onChange={(c) => handleCategoryChange(c ? c.id : "")}
              getOptionId={(c) => c.id}
              getOptionLabel={(c) => c.name}
              getOptionSubLabel={(c) => c.code}
              getOptionSearchText={(c) => `${c.name} ${c.code ?? ""}`}
              placeholder="اختر التصنيف"
            />
          </Field>

          <Field label="رمز الصنف">
            <div className="flex items-center gap-1.5" dir="ltr">
              {categoryPrefix && (
                <span
                  className={cn(
                    type.b2Emphasized,
                    "shrink-0 rounded-app-md bg-app-fill-f1 px-2.5 py-2 font-mono text-app-label-secondary",
                  )}
                >
                  {categoryPrefix}
                </span>
              )}
              <input
                type="text"
                required
                placeholder={categoryPrefix ? "01" : "الرمز"}
                value={codeSegment}
                onChange={(e) => setCodeSegment(e.target.value)}
                className={cn(inputClass, "font-mono")}
              />
            </div>
          </Field>
        </div>

        <Field
          label="نوع الصنف"
          aside={
            typeFromCategory && (
              <span className={cn(type.c1Regular, "text-app-accent")}>
                محدد من التصنيف
              </span>
            )
          }
        >
          <select
            value={itemType}
            onChange={(e) =>
              setItemType(e.target.value as InventoryItem["item_type"])
            }
            className={inputClass}
          >
            {(Object.keys(ITEM_TYPE_LABELS) as InventoryItemType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {ITEM_TYPE_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </Field>
      </Question>

      <Question
        number="2"
        title="كيف تُحسب كميته؟"
        subtitle="بهذه الوحدة يُسجَّل الرصيد وتُحسب التكلفة"
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {UNIT_CHOICES.map((choice) => {
            const active = uom === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => setUom(choice.value)}
                className={cn(
                  "rounded-app-md border px-3 py-2.5 text-start transition-colors",
                  active
                    ? "border-app-accent bg-app-accent/10"
                    : "border-app-separator bg-app-bg-primary hover:bg-app-fill-f1",
                )}
              >
                <span
                  className={cn(
                    type.b2Emphasized,
                    "block",
                    active ? "text-app-accent" : "text-app-label-primary",
                  )}
                >
                  {choice.label}
                </span>
                <span
                  className={cn(
                    type.c1Regular,
                    "block text-app-label-tertiary",
                  )}
                >
                  {choice.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Question>

      <Question
        number="3"
        title="هل يُورَّد في عبوات؟"
        subtitle="مثل براميل أو صناديق أو أكياس بسعة ثابتة"
      >
        <div className="inline-flex rounded-app-md border border-app-separator p-1 bg-app-bg-secondary">
          {[
            { value: false, label: "لا" },
            { value: true, label: "نعم، في عبوات" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setIsPackaged(opt.value)}
              className={cn(
                type.c1Emphasized,
                "rounded-app-sm px-4 py-1.5 transition-colors",
                isPackaged === opt.value
                  ? "bg-app-bg-primary text-app-label-primary shadow-sm"
                  : "text-app-label-secondary hover:text-app-label-primary",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isPackaged && (
          <div className="space-y-3 rounded-app-lg bg-app-bg-secondary p-4">
            <div
              className={cn(
                type.b2Regular,
                "flex flex-wrap items-center gap-2 text-app-label-primary",
              )}
            >
              <span>كل</span>
              <input
                type="text"
                placeholder="برميل"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className={cn(inputClass, "w-32")}
              />
              <span>يحتوي على</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                placeholder="200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={cn(inputClass, "w-28 font-mono")}
                dir="ltr"
              />
              <span>{unitLabel}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PACKAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPackageName(preset)}
                  className={cn(
                    type.c1Regular,
                    "rounded-full border px-2.5 py-0.5 transition-colors",
                    packageName === preset
                      ? "border-app-accent bg-app-accent text-white"
                      : "border-app-separator bg-app-bg-primary text-app-label-secondary hover:text-app-label-primary",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </Question>

      <Question
        number="4"
        title="المقاس"
        subtitle="اختياري — الطول والعرض والارتفاع بالمتر"
      >
        {showSize ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "الطول",
                  value: lengthM,
                  set: setLengthM,
                  ph: "1.00",
                },
                {
                  label: "العرض",
                  value: widthM,
                  set: setWidthM,
                  ph: "2.00",
                },
                {
                  label: "الارتفاع",
                  value: heightM,
                  set: setHeightM,
                  ph: "0.20",
                },
              ].map((f) => (
                <Field key={f.label} label={f.label}>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder={f.ph}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className={cn(inputClass, "font-mono")}
                    dir="ltr"
                  />
                </Field>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className={cn(type.c1Regular, "text-app-label-secondary")}>
                {volume > 0 ? (
                  <>
                    الحجم:{" "}
                    <span className="font-mono font-semibold text-app-accent">
                      {formatNumber(volume)} م³
                    </span>
                  </>
                ) : (
                  "أدخل الأبعاد الثلاثة لحساب الحجم"
                )}
              </span>
              {uom !== "m3" && (
                <button
                  type="button"
                  onClick={clearSize}
                  className={cn(
                    type.c1Regular,
                    "flex items-center gap-1 text-app-label-tertiary hover:text-app-status-danger",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  إزالة المقاس
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSize(true)}
            className={cn(
              type.c1Emphasized,
              "flex w-fit items-center gap-1.5 text-app-accent hover:underline",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة المقاس
          </button>
        )}
      </Question>

      <Question
        number="5"
        title="سعر البيع"
        subtitle="اختياري — سعر مبدئي يظهر في نقطة البيع ويمكن تعديله عند البيع"
      >
        <div className="inline-flex rounded-app-md border border-app-separator p-1 bg-app-bg-secondary">
          {(Object.keys(PRICE_BASIS_LABELS) as PriceBasis[]).map((basis) => (
            <button
              key={basis}
              type="button"
              onClick={() => setPriceBasis(basis)}
              className={cn(
                type.c1Emphasized,
                "rounded-app-sm px-4 py-1.5 transition-colors",
                priceBasis === basis
                  ? "bg-app-bg-primary text-app-label-primary shadow-sm"
                  : "text-app-label-secondary hover:text-app-label-primary",
              )}
            >
              {PRICE_BASIS_LABELS[basis]}
            </button>
          ))}
        </div>
        <Field
          label={priceBasis === "m3" ? "السعر لكل متر مكعب (د.ل)" : "السعر للقطعة (د.ل)"}
          hint={
            priceBasis === "m3"
              ? "سعر القطعة = السعر × الطول × العرض × الارتفاع"
              : undefined
          }
        >
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className={cn(inputClass, "font-mono w-48")}
            dir="ltr"
          />
        </Field>
        {priceBasis === "m3" && volume > 0 && Number(sellingPrice) > 0 && (
          <span className={cn(type.c1Regular, "text-app-label-secondary")}>
            سعر القطعة بمقاسها الحالي:{" "}
            <span className="font-mono font-semibold text-app-accent">
              {formatNumber(Number(sellingPrice) * volume)} د.ل
            </span>
          </span>
        )}
      </Question>
    </GuidedFormPage>
  );
};

export default InventoryItemFormPage;
