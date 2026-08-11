import React, { useState } from "react";
import { useAttributeLibrary, useCreateGlobalAttribute, useDeleteAttributeDefinition } from "../../hooks/useCategories";
import { InventoryAttributeDefinition } from "../../api/endpoints/categories";
import { Sliders, Plus, Trash2, CheckCircle2 } from "lucide-react";

export const AttributeLibraryPage: React.FC = () => {
  const { data: attributes, isLoading } = useAttributeLibrary();
  const createAttributeMutation = useCreateGlobalAttribute();
  const deleteAttributeMutation = useDeleteAttributeDefinition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [dataType, setDataType] = useState<"number" | "text" | "select" | "boolean">("number");
  const [uom, setUom] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAttributeMutation.mutate(
      {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "_"),
        data_type: dataType,
        unit_of_measure: uom || undefined,
        is_required_on_lot: isRequired,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setName("");
          setSlug("");
          setUom("");
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Sliders className="w-7 h-7 text-app-accent" />
            Global Attribute Definitions Library
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Master library of reusable attributes (Pressure, Weight, Density, Dimensions, Viscosity) linkable to products.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Master Attribute
        </button>
      </div>

      {/* Attributes Table */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            Loading master attributes...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Attribute Name</th>
                <th className="px-4 py-3 text-start">Slug</th>
                <th className="px-4 py-3 text-start">Data Type</th>
                <th className="px-4 py-3 text-start">Unit of Measure</th>
                <th className="px-4 py-3 text-start">Required on Lot</th>
                <th className="px-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {attributes?.map((attr: InventoryAttributeDefinition) => (
                <tr key={attr.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-medium">{attr.name}</td>
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{attr.slug}</td>
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
                      onClick={() => deleteAttributeMutation.mutate(attr.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {attributes?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-app-label-tertiary">
                    No master attributes defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-md w-full p-6 border border-app-separator shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-app-label-primary">Create Master Attribute</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Attribute Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pressure Rating"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. pressure_kpa"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Data Type</label>
                  <select
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value as any)}
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
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAttributeMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createAttributeMutation.isPending ? "Saving..." : "Save Master Attribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
