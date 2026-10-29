import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { WarehousesLedgerPage } from "../pages/inventory/WarehousesLedgerPage";
import WarehouseLedgerDetailPage from "../pages/inventory/WarehouseLedgerDetailPage";
import WarehouseItemDetailPage from "../pages/inventory/WarehouseItemDetailPage";
import { WarehouseTransfersPage } from "../pages/inventory/WarehouseTransfersPage";
import WarehouseTransferFormPage from "../pages/inventory/WarehouseTransferFormPage";
import WarehouseTransferDetailPage from "../pages/inventory/WarehouseTransferDetailPage";
import { usePermissions } from "../hooks/usePermissions";
import { INVENTORY_ROLES, STOCK_COUNT_ROLES } from "./routes.config";

// Item catalog management ("سجل الأصناف الرئيسي") moved to /settings/products/items and
// category/attribute templates ("إدارة قوالب الفئات والخصائص") to /settings/products/categories —
// this section is now the operational stock views only.
const INVENTORY_TABS = [
  { path: "/inventory/ledger", label: "سجل المخزون والطرود", allowedRoles: INVENTORY_ROLES },
  { path: "/inventory/transfers", label: "نقل بين المخازن", allowedRoles: INVENTORY_ROLES },
  { path: "/inventory/counts", label: "الجرد", allowedRoles: STOCK_COUNT_ROLES },
];

/**
 * The inventory section's tabs, each shown only to the roles that may open it
 * (an accounting manager reaches the counts to approve them, not the ledger).
 */
export const InventoryTabsLayout: React.FC = () => {
  const { hasRole } = usePermissions();
  return <SectionTabsLayout tabs={INVENTORY_TABS.filter((t) => hasRole(t.allowedRoles))} />;
};

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="categories" element={<Navigate to="/settings/products/categories" replace />} />
      <Route element={<InventoryTabsLayout />}>
        <Route path="ledger" element={<WarehousesLedgerPage />} />
        <Route path="ledger/:warehouseId" element={<WarehouseLedgerDetailPage />} />
        <Route path="ledger/:warehouseId/items/:itemId" element={<WarehouseItemDetailPage />} />
        <Route path="transfers" element={<WarehouseTransfersPage />} />
        <Route path="transfers/new" element={<WarehouseTransferFormPage />} />
        <Route path="transfers/:id" element={<WarehouseTransferDetailPage />} />
        <Route path="transfers/:id/edit" element={<WarehouseTransferFormPage />} />
      </Route>
    </Routes>
  );
};
