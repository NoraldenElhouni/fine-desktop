import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SalesOrdersPage } from "../pages/sales/SalesOrdersPage";
import { SalesOrderDetailPage } from "../pages/sales/SalesOrderDetailPage";
import { PosPage } from "../pages/sales/PosPage";
import { RestockRequestsPage } from "../pages/sales/RestockRequestsPage";

export const SalesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="orders" element={<SalesOrdersPage />} />
      <Route path="orders/:orderId" element={<SalesOrderDetailPage />} />
      <Route path="pos" element={<PosPage />} />
      <Route path="restock" element={<RestockRequestsPage />} />
    </Routes>
  );
};
