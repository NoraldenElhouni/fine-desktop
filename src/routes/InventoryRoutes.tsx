import React from "react";
import { Route, Routes } from "react-router-dom";
import { InventoryItemsPage } from "../pages/inventory/InventoryItemsPage";
import { StockLedgerPage } from "../pages/inventory/StockLedgerPage";
import { TankStockPage } from "../pages/inventory/TankStockPage";
import { StockAdjustmentsPage } from "../pages/inventory/StockAdjustmentsPage";
import { CategoryAttributeManagerPage } from "../pages/inventory/CategoryAttributeManagerPage";
import { AttributeLibraryPage } from "../pages/inventory/AttributeLibraryPage";

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="items" element={<InventoryItemsPage />} />
      <Route path="attributes" element={<AttributeLibraryPage />} />
      <Route path="categories" element={<CategoryAttributeManagerPage />} />
      <Route path="ledger" element={<StockLedgerPage />} />
      <Route path="tanks" element={<TankStockPage />} />
      <Route path="adjustments" element={<StockAdjustmentsPage />} />
    </Routes>
  );
};
