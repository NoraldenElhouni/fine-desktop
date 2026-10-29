import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Tag } from "lucide-react";
import { useInventoryItem } from "../../hooks/useInventory";
import { LabelPrintDialog, itemLabelData } from "../print/LabelPrint";

/**
 * The tabs of an existing item's page: its catalog data and its per-warehouse
 * stock limits and bins ("حدود المخزون", W4-02). A new item has no tabs — its
 * limits are set once it exists. The item's barcode label prints from here
 * (W4-03), with the saved name, code, price and barcode.
 */
export const ItemPageTabs: React.FC<{ itemId: string }> = ({ itemId }) => {
  const { data: item } = useInventoryItem(itemId);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  const tabs = [
    { path: `/settings/products/items/${itemId}/edit`, label: "بيانات الصنف" },
    { path: `/settings/products/items/${itemId}/levels`, label: "حدود المخزون" },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {tabs.map((t) => (
        <NavLink
          key={t.path}
          to={t.path}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? "bg-app-accent text-white"
                : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => setIsLabelOpen(true)}
        disabled={!item}
        className="ms-auto flex items-center gap-1.5 rounded-full border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-50"
      >
        <Tag className="h-3.5 w-3.5 text-app-accent" />
        طباعة ملصق
      </button>
      {item && (
        <LabelPrintDialog
          open={isLabelOpen}
          onClose={() => setIsLabelOpen(false)}
          title={`ملصق الصنف: ${item.name}`}
          labels={[itemLabelData(item)]}
        />
      )}
    </nav>
  );
};
