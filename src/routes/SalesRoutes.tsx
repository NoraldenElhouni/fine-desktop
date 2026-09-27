import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PosPage } from "../pages/sales/PosPage";
import { SaleDetailPage } from "../pages/sales/SaleDetailPage";
import { BundleDefinitionPage } from "../pages/sales/BundleDefinitionPage";
import { RestockRequestsPage } from "../pages/sales/RestockRequestsPage";

/**
 * The POS (at /sales/pos) is the one hub for selling: new sale, sales
 * history, quotations and approvals live inside it as tabs. A sale's own
 * page and its bundle-definition page are separate routes reached from
 * there, not tabs of the hub.
 */
export const SalesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="pos" replace />} />
      <Route path="pos" element={<PosPage />} />
      <Route path="restock" element={<RestockRequestsPage />} />
      <Route path=":saleId/bundles/:lineId" element={<BundleDefinitionPage />} />
      <Route path=":saleId" element={<SaleDetailPage />} />
    </Routes>
  );
};
