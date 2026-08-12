import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProductsPage } from "../pages/furniture/ProductsPage";
import { ProductionOrdersPage } from "../pages/furniture/ProductionOrdersPage";
import { ProductionOrderDetailPage } from "../pages/furniture/ProductionOrderDetailPage";

export const FurnitureRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="orders" element={<ProductionOrdersPage />} />
      <Route path="orders/:orderId" element={<ProductionOrderDetailPage />} />
    </Routes>
  );
};
