import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProductionBatchesPage } from "../pages/manufacturing/ProductionBatchesPage";
import { BatchBlocksPage } from "../pages/manufacturing/BatchBlocksPage";

export const ManufacturingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="batches" replace />} />
      <Route path="batches" element={<ProductionBatchesPage />} />
      <Route path="batches/:batchId" element={<BatchBlocksPage />} />
    </Routes>
  );
};
