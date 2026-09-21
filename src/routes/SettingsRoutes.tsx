import React, { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { ProductsPage } from "../pages/settings/ProductsPage";
import { RolesPage } from "../pages/settings/RolesPage";
import { OperatingUnitsPage } from "../pages/admin/OperatingUnitsPage";
import { InventoryItemsPage } from "../pages/inventory/InventoryItemsPage";
import { usePermissions } from "../hooks/usePermissions";

export const SettingsRoutes: React.FC = () => {
  const { hasRole } = usePermissions();
  const canManageUnits = hasRole(["owner", "admin"]);

  const tabs = useMemo(() => {
    const list = [
      { path: "/settings/items", label: "الأصناف" },
      { path: "/settings/products", label: "المنتجات وقوائم المواد" },
      { path: "/settings/roles", label: "الأدوار والصلاحيات" },
    ];
    if (canManageUnits) {
      list.push({ path: "/settings/units", label: "الوحدات التشغيلية" });
    }
    return list;
  }, [canManageUnits]);

  return (
    <Routes>
      <Route index element={<Navigate to="items" replace />} />
      <Route element={<SectionTabsLayout tabs={tabs} />}>
        <Route path="items" element={<InventoryItemsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="roles" element={<RolesPage />} />
        {canManageUnits && <Route path="units" element={<OperatingUnitsPage />} />}
        <Route path="server" element={<Navigate to="/settings/items" replace />} />
      </Route>
    </Routes>
  );
};
