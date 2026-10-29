import React from "react";
import { Route, Routes } from "react-router-dom";
import { InventoryTabsLayout } from "./InventoryRoutes";
import { StockCountsPage } from "../pages/inventory/StockCountsPage";
import StockCountDetailPage from "../pages/inventory/StockCountDetailPage";

/**
 * Physical stock counts ("الجرد", W4-01), mounted at /inventory/counts on its
 * own so the approvers (accounting manager) reach it without the rest of the
 * inventory section.
 */
export const StockCountRoutes: React.FC = () => (
  <Routes>
    <Route element={<InventoryTabsLayout />}>
      <Route index element={<StockCountsPage />} />
      <Route path=":id" element={<StockCountDetailPage />} />
    </Route>
  </Routes>
);
