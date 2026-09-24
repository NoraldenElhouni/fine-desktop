import React, { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { CompanySettingsPage } from "../pages/settings/CompanySettingsPage";
import { ReferenceLookupPage } from "../pages/settings/ReferenceLookupPage";
import { REFERENCE_LOOKUPS } from "../config/referenceLookups";
import { ProductsPage } from "../pages/settings/ProductsPage";
import { RolesPage } from "../pages/settings/RolesPage";
import { OperatingUnitsPage } from "../pages/admin/OperatingUnitsPage";
import { InventoryItemsPage } from "../pages/inventory/InventoryItemsPage";
import { CategoryAttributeManagerPage } from "../pages/inventory/CategoryAttributeManagerPage";
import { usePermissions } from "../hooks/usePermissions";

const PRODUCT_TABS = [
  { path: "/settings/products/items", label: "الأصناف" },
  { path: "/settings/products/categories", label: "الفئات والخصائص" },
  { path: "/settings/products/catalog", label: "المنتجات وقوائم المواد" },
];

/** One tab per reference list — add a config entry to add a tab + route. */
const DATA_TABS = REFERENCE_LOOKUPS.map((lookup) => ({
  path: `/settings/data/${lookup.path}`,
  label: lookup.title,
}));

export const SettingsRoutes: React.FC = () => {
  const { hasRole } = usePermissions();
  const canManageUnits = hasRole(["owner", "admin"]);

  const companyTabs = useMemo(() => {
    const list = [
      { path: "/settings/company/profile", label: "بيانات الشركة" },
      { path: "/settings/company/roles", label: "الأدوار والصلاحيات" },
    ];
    if (canManageUnits) {
      list.push({ path: "/settings/company/units", label: "الوحدات التشغيلية" });
    }
    return list;
  }, [canManageUnits]);

  return (
    <Routes>
      <Route index element={<Navigate to="company" replace />} />

      {/* 1 — Company settings */}
      <Route path="company" element={<SectionTabsLayout tabs={companyTabs} />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<CompanySettingsPage />} />
        <Route path="roles" element={<RolesPage />} />
        {canManageUnits && <Route path="units" element={<OperatingUnitsPage />} />}
      </Route>

      {/* 2 — Product settings */}
      <Route path="products" element={<SectionTabsLayout tabs={PRODUCT_TABS} />}>
        <Route index element={<Navigate to="items" replace />} />
        <Route path="items" element={<InventoryItemsPage />} />
        <Route path="categories" element={<CategoryAttributeManagerPage />} />
        <Route path="catalog" element={<ProductsPage />} />
      </Route>

      {/* 3 — Reference data settings (dummy data until the API lands) */}
      <Route path="data" element={<SectionTabsLayout tabs={DATA_TABS} />}>
        <Route index element={<Navigate to={REFERENCE_LOOKUPS[0].path} replace />} />
        {REFERENCE_LOOKUPS.map((lookup) => (
          <Route
            key={lookup.key}
            path={lookup.path}
            element={<ReferenceLookupPage config={lookup} />}
          />
        ))}
      </Route>

      {/* Legacy flat paths from the previous settings layout */}
      <Route path="items" element={<Navigate to="/settings/products/items" replace />} />
      <Route path="categories" element={<Navigate to="/settings/products/categories" replace />} />
      <Route path="roles" element={<Navigate to="/settings/company/roles" replace />} />
      <Route path="units" element={<Navigate to="/settings/company/units" replace />} />
      <Route path="server" element={<Navigate to="/settings/company/profile" replace />} />
      <Route path="*" element={<Navigate to="/settings/company/profile" replace />} />
    </Routes>
  );
};
