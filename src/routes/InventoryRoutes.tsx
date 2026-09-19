import React from "react";
import { Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { StockLedgerPage } from "../pages/inventory/StockLedgerPage";
import { TankStockPage } from "../pages/inventory/TankStockPage";
import { StockAdjustmentsPage } from "../pages/inventory/StockAdjustmentsPage";
import { CategoryAttributeManagerPage } from "../pages/inventory/CategoryAttributeManagerPage";

// Item catalog management ("سجل الأصناف الرئيسي") moved to /settings/items —
// this section is now the operational stock views only.
const INVENTORY_TABS = [
  { path: "/inventory/ledger", label: "سجل المخزون والطرود" },
  { path: "/inventory/tanks", label: "الخزانات" },
  { path: "/inventory/adjustments", label: "التسويات" },
  { path: "/inventory/categories", label: "الفئات" },
];

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<SectionTabsLayout tabs={INVENTORY_TABS} />}>
        <Route path="categories" element={<CategoryAttributeManagerPage />} />
        <Route path="ledger" element={<StockLedgerPage />} />
        <Route path="tanks" element={<TankStockPage />} />
        <Route path="adjustments" element={<StockAdjustmentsPage />} />
      </Route>
    </Routes>
  );
};
