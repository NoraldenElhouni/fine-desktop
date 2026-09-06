import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AttendancePage } from "../pages/hr/AttendancePage";
import { LaborRatesPage } from "../pages/hr/LaborRatesPage";
import { PayrollPage } from "../pages/hr/PayrollPage";
import { LeaveRequestsPage } from "../pages/hr/LeaveRequestsPage";

import { AuthorizedRoute } from "../components/AuthorizedRoute";

export const HrRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="attendance" replace />} />
      <Route
        path="attendance"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"]}>
            <AttendancePage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="rates"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "hr-manager", "accounting-manager"]}>
            <LaborRatesPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="payroll"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "hr-manager", "accounting-manager"]}>
            <PayrollPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="leave"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"]}>
            <LeaveRequestsPage />
          </AuthorizedRoute>
        }
      />
    </Routes>
  );
};
