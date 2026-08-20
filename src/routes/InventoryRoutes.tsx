import React from "react";
import { Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { InventoryItemsPage } from "../pages/inventory/InventoryItemsPage";
import { StockLedgerPage } from "../pages/inventory/StockLedgerPage";
import { TankStockPage } from "../pages/inventory/TankStockPage";
import { StockAdjustmentsPage } from "../pages/inventory/StockAdjustmentsPage";
import { CategoryAttributeManagerPage } from "../pages/inventory/CategoryAttributeManagerPage";
import { AttributeLibraryPage } from "../pages/inventory/AttributeLibraryPage";

const INVENTORY_TABS = [
  { path: "/inventory/items", label: "الأصناف" },
  { path: "/inventory/ledger", label: "سجل المخزون والطرود" },
  { path: "/inventory/tanks", label: "الخزانات" },
  { path: "/inventory/adjustments", label: "التسويات" },
  { path: "/inventory/categories", label: "الفئات" },
  { path: "/inventory/attributes", label: "مكتبة الخصائص" },
];

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<SectionTabsLayout tabs={INVENTORY_TABS} />}>
        <Route path="items" element={<InventoryItemsPage />} />
        <Route path="attributes" element={<AttributeLibraryPage />} />
        <Route path="categories" element={<CategoryAttributeManagerPage />} />
        <Route path="ledger" element={<StockLedgerPage />} />
        <Route path="tanks" element={<TankStockPage />} />
        <Route path="adjustments" element={<StockAdjustmentsPage />} />
      </Route>
    </Routes>
  );
};
