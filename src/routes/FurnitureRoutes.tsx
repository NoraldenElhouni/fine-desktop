import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SectionTabsLayout } from "../components/ui/SectionTabs";
import { ProductsPage } from "../pages/furniture/ProductsPage";
import { ProductionOrdersPage } from "../pages/furniture/ProductionOrdersPage";
import { ProductionOrderDetailPage } from "../pages/furniture/ProductionOrderDetailPage";

const FURNITURE_TABS = [
  { path: "/furniture/orders", label: "أوامر الإنتاج" },
  { path: "/furniture/products", label: "المنتجات وقوائم المواد" },
];

export const FurnitureRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="orders" replace />} />
      <Route element={<SectionTabsLayout tabs={FURNITURE_TABS} />}>
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<ProductionOrdersPage />} />
      </Route>
      <Route path="orders/:orderId" element={<ProductionOrderDetailPage />} />
    </Routes>
  );
};
