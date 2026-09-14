import React, { useEffect, useState } from "react";
import {
  Armchair, Plus, AlertTriangle, Copy, CheckCircle2, Trash2, Ruler, HardHat, Tag, PackagePlus, X,
} from "lucide-react";
import {
  useProducts, useCreateProduct, useProductBoms, useCreateBom, useActivateBom, useCloneBom,
  usePricePreview, useAddComponentLine, useRemoveComponentLine,
  useAddLaborRequirement, useRemoveLaborRequirement,
} from "../../hooks/useFurniture";
import { useInventoryItems, useCreateInventoryItem } from "../../hooks/useInventory";
import { Bom } from "../../api/endpoints/furniture";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { InventoryItem } from "../../api/endpoints/inventory";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const ProductsPage: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBomId, setSelectedBomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [createItemError, setCreateItemError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", sku: "", unit_of_measure: "each" });
  const [form, setForm] = useState({ name: "", sku: "", inventory_item_id: "", markup_factor: "1.25" });
  const [triedSubmit, setTriedSubmit] = useState(false);

  const [compForm, setCompForm] = useState({ item: "", qty: "1", cost: "0" });
  const [laborForm, setLaborForm] = useState({ role: "tailor", hours: "1", rate: "0" });

  const { data: products, isLoading } = useProducts();
  const { data: finishedItems, refetch: refetchFinishedItems } =
    useInventoryItems({ item_type: "furniture_finished_good" });
  const { data: allItems } = useInventoryItems({});
  const { data: boms } = useProductBoms(selectedProductId ?? undefined);
  const { data: preview } = usePricePreview(selectedBomId ?? undefined);

  const createProduct = useCreateProduct();
  const createInventoryItem = useCreateInventoryItem();
  const createBom = useCreateBom();
  const activateBom = useActivateBom();
  const cloneBom = useCloneBom();
  const addComponent = useAddComponentLine();
  const removeComponent = useRemoveComponentLine();
  const addLabor = useAddLaborRequirement();
  const removeLabor = useRemoveLaborRequirement();

  const selectedProduct = products?.data.find((p) => p.id === selectedProductId);
  const selectedBom: Bom | undefined = boms?.find((b) => b.id === selectedBomId);

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
        onError: (err) => fail(err, "Could not create the product."),
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
          apiErrorPayload(err)?.message ?? "Could not create the inventory item.",
        ),
      },
    );
  };

  const finishedPickerMissing = showCreate && hasFinishedOptions && !form.inventory_item_id;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Armchair className="w-7 h-7 text-app-accent" />
            Products & BOMs
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            One active BOM per product. Estimates here feed the quote; real costs come from the lots
            consumed when an order is built.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog */}
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm overflow-hidden">
          <div className="border-b border-app-separator px-4 py-3">
            <h2 className="text-sm font-bold text-app-label-primary">Catalog</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-xs text-app-label-secondary">Loading…</div>
          ) : (
            <div className="divide-y divide-app-separator">
              {products?.data.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setSelectedBomId(p.active_bom?.id ?? null);
                  }}
                  className={`w-full text-start px-4 py-3 hover:bg-app-fill-f1 transition-colors ${
                    selectedProductId === p.id ? "bg-app-accent-tint" : ""
                  }`}
                >
                  <div className="text-sm font-semibold text-app-label-primary">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-app-label-tertiary">{p.sku}</span>
                    {p.active_bom ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-app-accent-subtle text-app-accent font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> BOM v{p.active_bom.version}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-app-status-yellow/15 text-app-status-yellow font-semibold">
                        No active BOM
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {products?.data.length === 0 && (
                <div className="p-8 text-center text-xs text-app-label-tertiary">No products yet.</div>
              )}
            </div>
          )}
        </div>

        {/* BOM editor */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedProduct ? (
            <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-12 text-center text-xs text-app-label-tertiary">
              Select a product to edit its BOMs.
            </div>
          ) : (
            <>
              {/* Version strip */}
              <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {boms?.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBomId(b.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedBomId === b.id
                          ? "bg-app-accent text-white"
                          : b.is_active
                            ? "bg-app-accent-subtle text-app-accent"
                            : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
                      }`}
                    >
                      v{b.version}
                      {b.is_active && " ●"}
                    </button>
                  ))}

                  <div className="ms-auto flex gap-2">
                    <button
                      onClick={() =>
                        createBom.mutate(
                          { product_id: selectedProduct.id, activate: (boms?.length ?? 0) === 0 },
                          { onError: (e) => fail(e, "Could not create a BOM.") },
                        )
                      }
                      className="flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
                    >
                      <Plus className="w-3.5 h-3.5" /> New version
                    </button>
                    {selectedBom && (
                      <>
                        <button
                          onClick={() =>
                            cloneBom.mutate(selectedBom.id, { onError: (e) => fail(e, "Clone failed.") })
                          }
                          className="flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-secondary px-2.5 py-1.5 text-xs font-semibold hover:bg-app-fill-f1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Clone
                        </button>
                        {!selectedBom.is_active && (
                          <button
                            onClick={() =>
                              activateBom.mutate(selectedBom.id, {
                                onError: (e) => fail(e, "Activation failed."),
                              })
                            }
                            className="flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1.5 text-xs font-bold text-white hover:opacity-90"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedBom && (
                <>
                  {/* Components */}
                  <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
                    <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-app-accent" />
                      <h3 className="text-sm font-bold text-app-label-primary">Components</h3>
                    </div>
                    <div className="divide-y divide-app-separator">
                      {selectedBom.component_lines?.map((l) => (
                        <div key={l.id} className="flex items-center gap-3 px-4 py-2 text-xs">
                          <span className="font-semibold text-app-label-primary flex-1">
                            {l.inventory_item?.name}
                            <span className="text-app-label-tertiary font-mono ms-2">
                              {l.inventory_item?.sku}
                            </span>
                          </span>
                          <span className="font-mono">× {Number(l.quantity)}</span>
                          <span className="font-mono text-app-label-secondary">
                            est. {formatNumber(l.estimated_unit_cost)}
                          </span>
                          <button
                            onClick={() =>
                              removeComponent.mutate(
                                { bomId: selectedBom.id, lineId: l.id },
                                { onError: (e) => fail(e, "Could not remove the component.") },
                              )
                            }
                            className="p-1 rounded-lg text-app-label-tertiary hover:text-app-status-danger hover:bg-app-fill-f1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-app-separator p-3 flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-40">
                        <SearchableSelect<InventoryItem>
                          options={allItems?.data ?? []}
                          value={
                            allItems?.data.find((i) => i.id === compForm.item) ??
                            null
                          }
                          onChange={(i) =>
                            setCompForm({ ...compForm, item: i ? i.id : "" })
                          }
                          getOptionId={(i) => i.id}
                          getOptionLabel={(i) => i.name}
                          getOptionSubLabel={(i) => i.sku}
                          getOptionSearchText={(i) => `${i.name} ${i.sku}`}
                          placeholder="Add component…"
                          size="sm"
                        />
                      </div>
                      <input
                        type="number" step="0.01" min="0.01" placeholder="qty"
                        value={compForm.qty}
                        onChange={(e) => setCompForm({ ...compForm, qty: e.target.value })}
                        className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                      <input
                        type="number" step="0.01" min="0" placeholder="est. cost"
                        value={compForm.cost}
                        onChange={(e) => setCompForm({ ...compForm, cost: e.target.value })}
                        className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                      <button
                        disabled={!compForm.item || num(compForm.qty) <= 0}
                        onClick={() =>
                          addComponent.mutate(
                            {
                              bomId: selectedBom.id,
                              data: {
                                inventory_item_id: compForm.item,
                                quantity: num(compForm.qty),
                                estimated_unit_cost: num(compForm.cost),
                              },
                            },
                            {
                              onSuccess: () => setCompForm({ item: "", qty: "1", cost: "0" }),
                              onError: (e) => fail(e, "Could not add the component."),
                            },
                          )
                        }
                        className="rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Labor */}
                  <div className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
                    <div className="border-b border-app-separator px-4 py-3 flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-app-accent" />
                      <h3 className="text-sm font-bold text-app-label-primary">Labor</h3>
                    </div>
                    <div className="divide-y divide-app-separator">
                      {selectedBom.labor_requirements?.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 px-4 py-2 text-xs">
                          <span className="font-semibold text-app-label-primary flex-1 capitalize">{r.role}</span>
                          <span className="font-mono">{Number(r.estimated_hours)} h</span>
                          <span className="font-mono text-app-label-secondary">
                            @ {formatNumber(r.hourly_rate)}/h
                          </span>
                          <button
                            onClick={() =>
                              removeLabor.mutate(
                                { bomId: selectedBom.id, reqId: r.id },
                                { onError: (e) => fail(e, "Could not remove the labor row.") },
                              )
                            }
                            className="p-1 rounded-lg text-app-label-tertiary hover:text-app-status-danger hover:bg-app-fill-f1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-app-separator p-3 flex flex-wrap gap-2 items-end">
                      <select
                        value={laborForm.role}
                        onChange={(e) => setLaborForm({ ...laborForm, role: e.target.value })}
                        className="px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                      >
                        {["tailor", "carpenter", "upholsterer", "assembler", "operator", "other"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <input
                        type="number" step="0.5" min="0.5" placeholder="hours"
                        value={laborForm.hours}
                        onChange={(e) => setLaborForm({ ...laborForm, hours: e.target.value })}
                        className="w-20 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                      <input
                        type="number" step="0.5" min="0" placeholder="rate/h"
                        value={laborForm.rate}
                        onChange={(e) => setLaborForm({ ...laborForm, rate: e.target.value })}
                        className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                      />
                      <button
                        disabled={num(laborForm.hours) <= 0}
                        onClick={() =>
                          addLabor.mutate(
                            {
                              bomId: selectedBom.id,
                              data: {
                                role: laborForm.role,
                                estimated_hours: num(laborForm.hours),
                                hourly_rate: num(laborForm.rate),
                              },
                            },
                            {
                              onSuccess: () => setLaborForm({ role: "tailor", hours: "1", rate: "0" }),
                              onError: (e) => fail(e, "Could not add the labor row."),
                            },
                          )
                        }
                        className="rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price preview */}
                  {preview && (
                    <div className="rounded-2xl border border-app-accent/40 bg-app-accent-tint p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-app-accent" />
                        <h3 className="text-sm font-bold text-app-label-primary">Price Preview</h3>
                        <span className="text-[10px] text-app-label-tertiary">
                          estimates only — real cost comes from consumed lots
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <div className="text-app-label-secondary">Material</div>
                          <div className="font-mono font-bold text-app-label-primary">
                            {formatNumber(preview.estimated_material_cost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-app-label-secondary">Labor</div>
                          <div className="font-mono font-bold text-app-label-primary">
                            {formatNumber(preview.estimated_labor_cost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-app-label-secondary">Total × {preview.markup_factor}</div>
                          <div className="font-mono font-bold text-app-label-primary">
                            {formatNumber(preview.estimated_total_cost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-app-label-secondary">Suggested price</div>
                          <div className="font-mono font-bold text-app-accent">
                            {formatNumber(preview.suggested_price)} LYD
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create product modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">New Product</h3>
            <form onSubmit={submitProduct} className="space-y-3">
              <input
                type="text" required placeholder="Name — 3-Seat Sofa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
              />
              <input
                type="text" required placeholder="SKU — PROD-SOFA-3S"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />

              {hasFinishedOptions ? (
                <div>
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
                    placeholder="Finished-good inventory item…"
                    required
                  />
                  <p className="text-[10px] text-app-label-tertiary mt-1">
                    Where the built product lands in stock.
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

              <input
                type="number" step="0.05" min="1" placeholder="Markup factor"
                value={form.markup_factor}
                onChange={(e) => setForm({ ...form, markup_factor: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs font-mono border-app-separator focus:border-app-accent focus:outline-none"
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setTriedSubmit(false);
                    setForm({
                      name: "",
                      sku: "",
                      inventory_item_id: "",
                      markup_factor: "1.25",
                    });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createProduct.isPending ||
                    !hasFinishedOptions ||
                    !form.inventory_item_id
                  }
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createProduct.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-sm w-full p-5 border border-app-separator shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-app-label-primary flex items-center gap-2">
                  <PackagePlus className="h-4 w-4 text-app-status-info" />
                  أنشئ صنف منتج نهائي
                </h3>
                <p className="text-[10px] text-app-label-tertiary mt-1">
                  سيلتقطه النموذج تلقائياً بعد الحفظ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateItem(false)}
                aria-label="إغلاق"
                className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitNewFinishedItem} className="space-y-3">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setShowCreateItem(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createInventoryItem.isPending}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-app-status-info hover:opacity-90 rounded-xl disabled:opacity-50"
                >
                  {createInventoryItem.isPending ? "جاري الإنشاء…" : "إنشاء الصنف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
