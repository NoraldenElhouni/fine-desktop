import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AttendancePage } from "../pages/hr/AttendancePage";
import { LaborRatesPage } from "../pages/hr/LaborRatesPage";
import { PayrollPage } from "../pages/hr/PayrollPage";
import { LeaveRequestsPage } from "../pages/hr/LeaveRequestsPage";

export const HrRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="attendance" replace />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="rates" element={<LaborRatesPage />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="leave" element={<LeaveRequestsPage />} />
    </Routes>
  );
};
