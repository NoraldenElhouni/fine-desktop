import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CutterWorkOrdersPage } from "../pages/cutter/CutterWorkOrdersPage";
import { CutterWorkOrderDetailPage } from "../pages/cutter/CutterWorkOrderDetailPage";

export const CutterRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="orders" element={<CutterWorkOrdersPage />} />
      <Route path="orders/:orderId" element={<CutterWorkOrderDetailPage />} />
    </Routes>
  );
};
