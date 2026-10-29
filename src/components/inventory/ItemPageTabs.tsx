import React from "react";
import { NavLink } from "react-router-dom";

/**
 * The tabs of an existing item's page: its catalog data and its per-warehouse
 * stock limits and bins ("حدود المخزون", W4-02). A new item has no tabs — its
 * limits are set once it exists.
 */
export const ItemPageTabs: React.FC<{ itemId: string }> = ({ itemId }) => {
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
    </nav>
  );
};
