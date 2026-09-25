import React, { useEffect, useState } from "react";
import { Armchair, Plus, AlertTriangle, PackagePlus } from "lucide-react";
import { useProducts, useCreateProduct } from "../../hooks/useFurniture";
import { useInventoryItems, useCreateInventoryItem } from "../../hooks/useInventory";
import { apiErrorPayload } from "../../api/endpoints/production";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { InventoryItem } from "../../api/endpoints/inventory";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const ProductsPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [createItemError, setCreateItemError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", sku: "", unit_of_measure: "each" });
  const [form, setForm] = useState({ name: "", sku: "", inventory_item_id: "", markup_factor: "1.25" });
  const [triedSubmit, setTriedSubmit] = useState(false);

  const { data: products, isLoading } = useProducts();
  const { data: finishedItems, refetch: refetchFinishedItems } =
    useInventoryItems({ item_type: "furniture_finished_good" });

  const createProduct = useCreateProduct();
  const createInventoryItem = useCreateInventoryItem();

  const finishedOptions: InventoryItem[] = finishedItems?.data ?? [];
  const hasFinishedOptions = finishedOptions.length > 0;

  // Auto-pick the only finished-good if the operator has just one.
  useEffect(() => {
    if (finishedOptions.length === 1 && !form.inventory_item_id) {
      setForm((f) => ({ ...f, inventory_item_id: finishedOptions[0].id }));
    }
  }, [finishedOptions.length, finishedOptions, form.inventory_item_id]);

  const fail = (err: unknown, fallback: string) =>
    setError(apiErrorPayload(err)?.message ?? fallback);

  const submitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (!form.inventory_item_id) {
      return;
    }
    setError(null);
    createProduct.mutate(
      {
        name: form.name,
        sku: form.sku,
        inventory_item_id: form.inventory_item_id,
        markup_factor: num(form.markup_factor) || undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setTriedSubmit(false);
          setForm({ name: "", sku: "", inventory_item_id: "", markup_factor: "1.25" });
        },
        onError: (err) => fail(err, "تعذر إنشاء المنتج."),
      },
    );
  };

  const submitNewFinishedItem = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateItemError(null);
    if (!itemForm.name.trim() || !itemForm.sku.trim()) {
      setCreateItemError("الاسم و SKU مطلوبان.");
      return;
    }
    createInventoryItem.mutate(
      {
        name: itemForm.name.trim(),
        sku: itemForm.sku.trim(),
        item_type: "furniture_finished_good",
        unit_of_measure: itemForm.unit_of_measure,
      },
      {
        onSuccess: async (response) => {
          const created = response.data;
          setItemForm({ name: "", sku: "", unit_of_measure: "each" });
          setShowCreateItem(false);
          // The query is stale by one item; refresh so the picker shows the
          // new row, then auto-select it for the operator.
          await refetchFinishedItems();
          setForm((f) => ({ ...f, inventory_item_id: created.id }));
          setTriedSubmit(false);
        },
        onError: (err) => setCreateItemError(
          apiErrorPayload(err)?.message ?? "تعذر إنشاء صنف المخزون.",
        ),
      },
    );
  };

  const finishedPickerMissing = showCreate && hasFinishedOptions && !form.inventory_item_id;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Armchair className="w-7 h-7 text-app-accent" />
            المنتجات
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كتالوج المنتجات القابلة للبيع، كل منتج مرتبط بصنف مخزون تام.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> منتج جديد
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
        <div className="border-b border-app-separator px-4 py-3">
          <h2 className="text-sm font-bold text-app-label-primary">الكتالوج</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-xs text-app-label-secondary">جاري التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {products?.data.map((p) => (
              <div key={p.id} className="w-full text-start px-4 py-3">
                <div className="text-sm font-semibold text-app-label-primary">{p.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-app-label-tertiary">{p.sku}</span>
                  {p.inventory_item?.sku && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-fill-f1 text-app-label-secondary font-semibold">
                      {p.inventory_item.sku}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {products?.data.length === 0 && (
              <div className="p-8 text-center text-xs text-app-label-tertiary">لا توجد منتجات بعد.</div>
            )}
          </div>
        )}
      </div>

      {/* Create product modal */}
      <Dialog
        open={showCreate}
        onOpenChange={(next) => {
          setShowCreate(next);
          if (!next) {
            setTriedSubmit(false);
            setForm({
              name: "",
              sku: "",
              inventory_item_id: "",
              markup_factor: "1.25",
            });
          }
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>منتج جديد</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <form id="new-product-form" onSubmit={submitProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">اسم المنتج</label>
                <input
                  type="text" required placeholder="مثال: كنبة 3 مقاعد"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">رمز الصنف (SKU)</label>
                <input
                  type="text" required placeholder="PROD-SOFA-3S"
                  dir="ltr"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none text-start"
                />
              </div>

              {hasFinishedOptions ? (
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">صنف المنتج التام بالمخزون</label>
                  <SearchableSelect<InventoryItem>
                    options={finishedOptions}
                    value={
                      finishedOptions.find(
                        (i) => i.id === form.inventory_item_id,
                      ) ?? null
                    }
                    onChange={(i) =>
                      setForm({
                        ...form,
                        inventory_item_id: i ? i.id : "",
                      })
                    }
                    getOptionId={(i) => i.id}
                    getOptionLabel={(i) => i.name}
                    getOptionSubLabel={(i) => i.sku}
                    getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                    placeholder="صنف المنتج التام…"
                    required
                  />
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    الصنف الذي يُسجَّل فيه المنتج عند اكتمال تصنيعه.
                  </p>
                  {triedSubmit && finishedPickerMissing && (
                    <p className="text-[11px] text-app-status-danger mt-1.5 font-semibold">
                      الرجاء اختيار صنف مخزون قبل المتابعة.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-status-info/40 bg-app-status-info/5 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <PackagePlus className="h-4 w-4 text-app-status-info shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold text-app-label-primary">
                        لا توجد أصناف منتجات نهائية بعد
                      </div>
                      <p className="text-app-label-secondary mt-0.5">
                        كل منتج يجب أن يربط بصنف مخزون من نوع{' '}
                        <span className="font-mono">furniture_finished_good</span>{' '}
                        يحدد الشكل الذي يدخل به المنتج للمخزون.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateItem(true);
                      setCreateItemError(null);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-app-status-info/40 bg-app-bg-secondary px-3 py-1.5 text-xs font-bold text-app-status-info hover:bg-app-status-info/10 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> أنشئ صنف منتج نهائي
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">معامل هامش الربح</label>
                <input
                  type="number" step="0.05" min="1" placeholder="1.25"
                  value={form.markup_factor}
                  onChange={(e) => setForm({ ...form, markup_factor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="new-product-form"
              disabled={
                createProduct.isPending ||
                !hasFinishedOptions ||
                !form.inventory_item_id
              }
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createProduct.isPending ? "جاري الإنشاء…" : "إنشاء"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateItem} onOpenChange={setShowCreateItem} className="z-[60]">
        <DialogContent size="sm">
          <DialogHeader>
            <div>
              <DialogTitle className="flex items-center gap-2">
                <PackagePlus className="h-4 w-4 text-app-status-info" />
                أنشئ صنف منتج نهائي
              </DialogTitle>
              <DialogDescription>
                سيلتقطه النموذج تلقائياً بعد الحفظ.
              </DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>

          <DialogBody>
            <form id="new-finished-item-form" onSubmit={submitNewFinishedItem} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 3-Seat Sofa"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  required
                  placeholder="PROD-SOFA-3S"
                  dir="ltr"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none text-start"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                  وحدة القياس
                </label>
                <SearchableSelect<{ value: string; label: string }>
                  options={[
                    { value: "each", label: "each — وحدة" },
                    { value: "kg", label: "kg — كيلوغرام" },
                    { value: "liter", label: "liter — لتر" },
                    { value: "meter", label: "meter — متر" },
                    { value: "m3", label: "m³ — متر مكعب" },
                  ]}
                  value={
                    { value: itemForm.unit_of_measure, label: itemForm.unit_of_measure }
                  }
                  onChange={(v) => setItemForm({ ...itemForm, unit_of_measure: v?.value ?? "each" })}
                  getOptionId={(v) => v.value}
                  getOptionLabel={(v) => v.label}
                  placeholder="اختر..."
                  size="sm"
                />
              </div>

              {createItemError && (
                <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-2 text-[11px] text-app-status-danger">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{createItemError}</span>
                </div>
              )}

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowCreateItem(false)}
              className="px-3 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="new-finished-item-form"
              disabled={createInventoryItem.isPending}
              className="px-4 py-1.5 text-xs font-bold text-white bg-app-status-info hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createInventoryItem.isPending ? "جاري الإنشاء…" : "إنشاء الصنف"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
