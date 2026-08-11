import React, { useState } from "react";
import { useItemCategories, useCreateItemCategory, useCreateAttributeDefinition, useDeleteAttributeDefinition } from "../../hooks/useCategories";
import { ItemCategory, InventoryAttributeDefinition } from "../../api/endpoints/categories";
import { Tags, Plus, Trash2, Layers, CheckCircle2, Sliders } from "lucide-react";

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
      { name: catName, code: catCode, description: catDesc },
      {
        onSuccess: () => {
          setIsCatModalOpen(false);
          setCatName("");
          setCatCode("");
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Tags className="w-7 h-7 text-app-accent" />
            Category & Attribute Template Manager
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Configure item categories and define required dynamic specs (Pressure, Weight, Density, Purity).
          </p>
        </div>

        <button
          onClick={() => setIsCatModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Item Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="bg-app-bg-primary rounded-2xl border border-app-separator p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-app-label-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-app-accent" /> Product Categories
          </h3>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-app-label-secondary">Loading categories...</div>
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
                    <div className="text-[10px] text-app-label-tertiary mt-2">
                      {cat.attribute_definitions?.length || 0} Dynamic Attributes Configured
                    </div>
                  </div>
                );
              })}
              {categories?.length === 0 && (
                <div className="p-6 text-center text-xs text-app-label-tertiary">No categories created yet.</div>
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
                    Attribute Template: {selectedCategory.name}
                  </h2>
                  <p className="text-xs text-app-label-secondary">
                    Define custom spec fields enforced on items & serialized stock lots.
                  </p>
                </div>
                <button
                  onClick={() => setIsAttrModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Attribute Field
                </button>
              </div>

              {/* Attribute Definitions Table */}
              <div className="overflow-hidden rounded-xl border border-app-separator bg-app-bg-secondary">
                <table className="w-full text-start text-xs">
                  <thead className="border-b border-app-separator bg-app-bg-primary text-app-label-secondary font-bold">
                    <tr>
                      <th className="px-4 py-3 text-start">Field Name</th>
                      <th className="px-4 py-3 text-start">Slug</th>
                      <th className="px-4 py-3 text-start">Data Type</th>
                      <th className="px-4 py-3 text-start">UOM</th>
                      <th className="px-4 py-3 text-start">Required on Lot</th>
                      <th className="px-4 py-3 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-separator text-app-label-primary">
                    {selectedCategory.attribute_definitions?.map((attr: InventoryAttributeDefinition) => (
                      <tr key={attr.id} className="hover:bg-app-fill-f1 transition-colors">
                        <td className="px-4 py-3 font-medium">{attr.name}</td>
                        <td className="px-4 py-3 font-mono text-app-accent">{attr.slug}</td>
                        <td className="px-4 py-3 uppercase font-semibold text-[10px]">{attr.data_type}</td>
                        <td className="px-4 py-3 font-semibold text-app-label-secondary">{attr.unit_of_measure || "--"}</td>
                        <td className="px-4 py-3">
                          {attr.is_required_on_lot ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">Required</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-app-fill-f1 text-app-label-tertiary">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button
                            onClick={() => handleDeleteAttribute(attr.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedCategory.attribute_definitions?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-app-label-tertiary">
                          No attribute fields configured for this category yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-app-label-tertiary space-y-2">
              <Sliders className="w-8 h-8 text-app-label-tertiary" />
              <p className="text-xs">Select a product category from the left panel to configure its dynamic attribute template.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Creation Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">Create Item Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foam Blocks"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Category Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT-FOAM"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCatMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createCatMutation.isPending ? "Creating..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attribute Field Creation Modal */}
      {isAttrModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">
              Add Attribute to {selectedCategory.name}
            </h3>
            <form onSubmit={handleCreateAttribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pressure Rating"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Field Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. pressure_kpa"
                    value={attrSlug}
                    onChange={(e) => setAttrSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Data Type</label>
                  <select
                    value={attrDataType}
                    onChange={(e) => setAttrDataType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                    <option value="select">Select Dropdown</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Unit of Measure (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. kPa, kg/m³, L, %"
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
                  Required when logging a Stock Lot
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsAttrModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAttrMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createAttrMutation.isPending ? "Adding..." : "Save Attribute Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
