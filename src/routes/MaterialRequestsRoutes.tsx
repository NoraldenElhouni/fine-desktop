import React from "react";
import { Route, Routes } from "react-router-dom";
import { MaterialRequestsPage } from "../pages/materials/MaterialRequestsPage";

export const MaterialRequestsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MaterialRequestsPage />} />
    </Routes>
  );
};
