import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { WarehousesLedgerPage } from "../pages/inventory/WarehousesLedgerPage";
import WarehouseLedgerDetailPage from "../pages/inventory/WarehouseLedgerDetailPage";
import WarehouseItemDetailPage from "../pages/inventory/WarehouseItemDetailPage";

// Item catalog management ("سجل الأصناف الرئيسي") moved to /settings/products/items and
// category/attribute templates ("إدارة قوالب الفئات والخصائص") to /settings/products/categories —
// this section is now the operational stock views only.
const INVENTORY_TABS = [
  { path: "/inventory/ledger", label: "سجل المخزون والطرود" },
];

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="categories" element={<Navigate to="/settings/products/categories" replace />} />
      <Route element={<SectionTabsLayout tabs={INVENTORY_TABS} />}>
        <Route path="ledger" element={<WarehousesLedgerPage />} />
        <Route path="ledger/:warehouseId" element={<WarehouseLedgerDetailPage />} />
        <Route path="ledger/:warehouseId/items/:itemId" element={<WarehouseItemDetailPage />} />
      </Route>
    </Routes>
  );
};
