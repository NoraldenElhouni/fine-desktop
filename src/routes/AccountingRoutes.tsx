import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { JournalEntriesPage } from "../pages/accounting/JournalEntriesPage";
import { ChartOfAccountsPage } from "../pages/accounting/ChartOfAccountsPage";
import { TrialBalancePage } from "../pages/accounting/TrialBalancePage";
import { FinancialReportsPage } from "../pages/accounting/FinancialReportsPage";
import { OverheadExpensesPage } from "../pages/accounting/OverheadExpensesPage";
import { FixedAssetsPage } from "../pages/accounting/FixedAssetsPage";

export const AccountingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="journal" replace />} />
      <Route path="journal" element={<JournalEntriesPage />} />
      <Route path="accounts" element={<ChartOfAccountsPage />} />
      <Route path="trial-balance" element={<TrialBalancePage />} />
      <Route path="reports" element={<FinancialReportsPage />} />
      <Route path="overhead" element={<OverheadExpensesPage />} />
      <Route path="assets" element={<FixedAssetsPage />} />
    </Routes>
  );
};
