import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthorizedRoute } from "../components/AuthorizedRoute";
import { AssemblyOrdersPage } from "../pages/furniture/AssemblyOrdersPage";
import { NewAssemblyOrderPage } from "../pages/furniture/NewAssemblyOrderPage";
import { AssemblyOrderDetailPage } from "../pages/furniture/AssemblyOrderDetailPage";

/**
 * The furniture section ("الأثاث", W4-07): assembly orders, mounted at
 * /furniture. Opening an order needs create-furniture on top of the view.
 */
export const FurnitureRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="assembly" replace />} />
    <Route path="assembly" element={<AssemblyOrdersPage />} />
    <Route
      path="assembly/new"
      element={
        <AuthorizedRoute permission="create-furniture">
          <NewAssemblyOrderPage />
        </AuthorizedRoute>
      }
    />
    <Route path="assembly/:id" element={<AssemblyOrderDetailPage />} />
  </Routes>
);
