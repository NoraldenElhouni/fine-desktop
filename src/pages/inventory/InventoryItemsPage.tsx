import React, { useState } from "react";
import { useInventoryItems, useCreateInventoryItem } from "../../hooks/useInventory";
import { useItemCategories, useAttributeLibrary } from "../../hooks/useCategories";
import { InventoryItem } from "../../api/endpoints/inventory";
import { formatDate } from "../../lib/utils/format";
import { Package, PackagePlus, Plus, Search, Filter, Tags, Sliders } from "lucide-react";
import { StockIntakeModal } from "./StockIntakeModal";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Package className="w-7 h-7 text-app-accent" />
            Inventory Item Master
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            Catalog of raw materials, foam blocks, cut pieces, slices, sellable items, and custom product attribute assignments.
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
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-app-bg-primary p-4 rounded-2xl border border-app-separator shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-app-label-tertiary" />
          <input
            type="text"
            placeholder="Search by SKU or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary placeholder-app-label-tertiary focus:border-app-accent focus:outline-none"
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
              placeholder="All Categories"
              size="sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-app-separator rounded-xl bg-app-bg-secondary text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          >
            <option value="">All Item Types</option>
            <option value="raw_material">Raw Material</option>
            <option value="foam_block">Foam Block</option>
            <option value="cut_template_piece">Cut Template Piece</option>
            <option value="slice">Slice</option>
            <option value="byproduct_fill">Byproduct Fill</option>
            <option value="furniture_finished_good">Furniture Finished Good</option>
            <option value="barrel">Barrel</option>
            <option value="pallet">Pallet</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            Loading inventory items...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">SKU</th>
                <th className="px-4 py-3 text-start">Name</th>
                <th className="px-4 py-3 text-start">Category</th>
                <th className="px-4 py-3 text-start">Assigned Attributes</th>
                <th className="px-4 py-3 text-start">Dual UOM (Container / Measure)</th>
                <th className="px-4 py-3 text-start">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {itemData?.data.map((item: InventoryItem) => (
                <tr key={item.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">{item.sku}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    {item.category ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                        <Tags className="w-3 h-3" /> {item.category.name}
                      </span>
                    ) : (
                      <span className="text-app-label-tertiary">Uncategorized</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.attribute_definitions && item.attribute_definitions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.attribute_definitions.map((attr) => (
                          <span key={attr.id} className="px-2 py-0.5 text-[10px] font-medium rounded bg-app-bg-secondary border border-app-separator text-app-label-primary">
                            {attr.name} ({attr.unit_of_measure || attr.data_type})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-app-label-tertiary text-[10px]">No attributes</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-app-label-secondary">
                    {item.primary_uom || "each"} / {item.secondary_uom || item.unit_of_measure}
                  </td>
                  <td className="px-4 py-3 text-app-label-tertiary">{formatDate(item.created_at)}</td>
                </tr>
              ))}
              {itemData?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-app-label-tertiary">
                    No inventory items found.
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
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-app-label-primary">Create Inventory Item</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Item Category</label>
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
                  placeholder="Select Product Category Template"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">SKU</label>
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
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Item Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="foam_block">Foam Block</option>
                    <option value="cut_template_piece">Cut Template Piece</option>
                    <option value="slice">Slice</option>
                    <option value="byproduct_fill">Byproduct Fill</option>
                    <option value="furniture_finished_good">Furniture Finished Good</option>
                    <option value="barrel">Barrel</option>
                    <option value="pallet">Pallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Base UOM</label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none"
                  >
                    <option value="each">Each</option>
                    <option value="m3">m³</option>
                    <option value="kg">kg</option>
                    <option value="meter">Meter</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
              </div>

              {/* Product Attributes Many-to-Many Assignment */}
              <div className="space-y-2 p-3 bg-app-bg-secondary rounded-xl border border-app-separator">
                <label className="block text-xs font-semibold text-app-label-primary uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-app-accent" /> Assign Product Attributes
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
                      No master attributes available. Add them in Attribute Library.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Container UOM</label>
                  <input
                    type="text"
                    placeholder="e.g. barrel, block"
                    value={primaryUom}
                    onChange={(e) => setPrimaryUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">Measure UOM</label>
                  <input
                    type="text"
                    placeholder="e.g. liter, m3, kg"
                    value={secondaryUom}
                    onChange={(e) => setSecondaryUom(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
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
                  disabled={createItemMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createItemMutation.isPending ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isIntakeOpen && (
        <StockIntakeModal items={itemData?.data ?? []} onClose={() => setIsIntakeOpen(false)} />
      )}
    </div>
  );
};
