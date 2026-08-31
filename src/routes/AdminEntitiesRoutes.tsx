import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useIsCompanyWide } from "../hooks/useAccounting";
import { AdminEntitiesPage } from "../pages/admin/AdminEntitiesPage";

const AdminEntitiesRoutes: React.FC = () => {
  const isCompanyWide = useIsCompanyWide();

  if (!isCompanyWide) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route index element={<AdminEntitiesPage />} />
    </Routes>
  );
};

export default AdminEntitiesRoutes;
