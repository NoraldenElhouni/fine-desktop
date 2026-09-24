import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { StockLedgerPage } from "../pages/inventory/StockLedgerPage";
import { TankStockPage } from "../pages/inventory/TankStockPage";
import { StockAdjustmentsPage } from "../pages/inventory/StockAdjustmentsPage";

// Item catalog management ("سجل الأصناف الرئيسي") moved to /settings/products/items and
// category/attribute templates ("إدارة قوالب الفئات والخصائص") to /settings/products/categories —
// this section is now the operational stock views only.
const INVENTORY_TABS = [
  { path: "/inventory/ledger", label: "سجل المخزون والطرود" },
  { path: "/inventory/tanks", label: "الخزانات" },
  { path: "/inventory/adjustments", label: "التسويات" },
];

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="categories" element={<Navigate to="/settings/products/categories" replace />} />
      <Route element={<SectionTabsLayout tabs={INVENTORY_TABS} />}>
        <Route path="ledger" element={<StockLedgerPage />} />
        <Route path="tanks" element={<TankStockPage />} />
        <Route path="adjustments" element={<StockAdjustmentsPage />} />
      </Route>
    </Routes>
  );
};
