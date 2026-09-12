import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { ServerConfigPage } from "../pages/settings/ServerConfigPage";
import { ProductsPage } from "../pages/settings/ProductsPage";
import { RolesPage } from "../pages/settings/RolesPage";

const SETTINGS_TABS = [
  { path: "/settings/server", label: "إعدادات السيرفر" },
  { path: "/settings/products", label: "المنتجات وقوائم المواد" },
  { path: "/settings/roles", label: "الأدوار والصلاحيات" },
];

export const SettingsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="server" replace />} />
      <Route element={<SectionTabsLayout tabs={SETTINGS_TABS} />}>
        <Route path="server" element={<ServerConfigPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="roles" element={<RolesPage />} />
      </Route>
    </Routes>
  );
};
