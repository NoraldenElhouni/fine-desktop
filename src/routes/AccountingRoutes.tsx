import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { JournalEntriesPage } from "../pages/accounting/JournalEntriesPage";
import { ChartOfAccountsPage } from "../pages/accounting/ChartOfAccountsPage";
import AccountDetailPage from "../pages/accounting/AccountDetailPage";
import { TrialBalancePage } from "../pages/accounting/TrialBalancePage";
import { FinancialReportsPage } from "../pages/accounting/FinancialReportsPage";
import { OverheadExpensesPage } from "../pages/accounting/OverheadExpensesPage";
import { FixedAssetsPage } from "../pages/accounting/FixedAssetsPage";

import { AuthorizedRoute } from "../components/AuthorizedRoute";

export const AccountingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="journal" replace />} />
      <Route
        path="journal"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <JournalEntriesPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="accounts"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <ChartOfAccountsPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="accounts/:id"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <AccountDetailPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="trial-balance"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <TrialBalancePage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="reports"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager", "treasury-officer", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"]}>
            <FinancialReportsPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="overhead"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <OverheadExpensesPage />
          </AuthorizedRoute>
        }
      />
      <Route
        path="assets"
        element={
          <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager"]}>
            <FixedAssetsPage />
          </AuthorizedRoute>
        }
      />
    </Routes>
  );
};
