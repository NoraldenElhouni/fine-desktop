import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginPage from "./auth/LoginPage";
import ChangePasswordPage from "./auth/ChangePasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { ServerConfigDialog } from "../components/settings/ServerConfigDialog";
import Dashboard from "./Dashboard";
import { OwnerDashboardPage } from "./OwnerDashboardPage";
import { FinancialReportsPage } from "./accounting/FinancialReportsPage";
import { useIsCompanyWide } from "../hooks/useAccounting";
import OrdersRoutes from "../routes/OrdersRoutes";
import UsersRoutes from "../routes/UsersRoutes";
import ClientsRoutes from "../routes/ClientsRoutes";
import AdminEntitiesRoutes from "../routes/AdminEntitiesRoutes";
import EmployeesRoutes from "../routes/EmployeesRoutes";
import OperatingUnitsRoutes from "../routes/OperatingUnitsRoutes";
import BlueprintsRoutes from "../routes/BlueprintsRoutes";
import { InventoryRoutes } from "../routes/InventoryRoutes";
import { ManufacturingRoutes } from "../routes/ManufacturingRoutes";
import { CutterRoutes } from "../routes/CutterRoutes";
import { FurnitureRoutes } from "../routes/FurnitureRoutes";
import { SalesRoutes } from "../routes/SalesRoutes";
import { AccountingRoutes } from "../routes/AccountingRoutes";
import { HrRoutes } from "../routes/HrRoutes";
import { SettingsRoutes } from "../routes/SettingsRoutes";
import { MaterialRequestsRoutes } from "../routes/MaterialRequestsRoutes";

import { CategoryHubPage } from "./hub/CategoryHubPage";

import SuppliersPage from "./procurement/SuppliersPage";
import ImportOrdersPage from "./procurement/ImportOrdersPage";
import TreasuryPage from "./treasury/TreasuryPage";

import { AuthorizedRoute } from "../components/AuthorizedRoute";
import { ALL_MANAGER_ROLES } from "../routes/routes.config";

/**
 * The landing screen depends on who is looking: a company-wide role gets the
 * owner oversight dashboard, unit staff keep their operational one.
 */
const HomeDashboard = () => {
  const isCompanyWide = useIsCompanyWide();

  return isCompanyWide ? <OwnerDashboardPage /> : <Dashboard />;
};

const App = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.code === "KeyS" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        setIsServerModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<HomeDashboard />} />
            <Route path="hub/:categoryId" element={<CategoryHubPage />} />
            <Route
              path="admin/entities/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin"]}>
                  <AdminEntitiesRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="admin/units/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin"]}>
                  <OperatingUnitsRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="admin/blueprints/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin"]}>
                  <BlueprintsRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <AuthorizedRoute allowedRoles={ALL_MANAGER_ROLES}>
                  <SuppliersPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="import-orders"
              element={
                <AuthorizedRoute allowedRoles={ALL_MANAGER_ROLES}>
                  <ImportOrdersPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="treasury"
              element={
                <AuthorizedRoute allowedRoles={ALL_MANAGER_ROLES}>
                  <TreasuryPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="employees/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"]}>
                  <EmployeesRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="clients/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "store-manager", "pos-cashier", "accounting-manager", "unit_manager", "manager"]}>
                  <ClientsRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="orders/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "furniture-manager", "store-manager", "unit_manager", "manager"]}>
                  <OrdersRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="users/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin"]}>
                  <UsersRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="inventory/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "inventory-manager", "foam-manager", "foam-operator", "cutter-manager", "cutter-operator", "furniture-manager", "assembler", "store-manager", "unit_manager", "manager"]}>
                  <InventoryRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="manufacturing/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "foam-manager", "foam-operator", "unit_manager", "manager"]}>
                  <ManufacturingRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="cutter/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "cutter-manager", "cutter-operator", "unit_manager", "manager"]}>
                  <CutterRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="furniture/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "furniture-manager", "assembler", "unit_manager", "manager"]}>
                  <FurnitureRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="settings/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "furniture-manager", "assembler", "unit_manager", "manager"]}>
                  <SettingsRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="material-requests"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "furniture-manager", "cutter-manager", "foam-manager", "unit_manager", "manager"]}>
                  <MaterialRequestsRoutes />
                </AuthorizedRoute>
              }
            />
            <Route
              path="sales/*"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "store-manager", "pos-cashier", "unit_manager", "manager"]}>
                  <SalesRoutes />
                </AuthorizedRoute>
              }
            />
            <Route path="accounting/*" element={<AccountingRoutes />} />
            <Route path="hr/*" element={<HrRoutes />} />
            <Route
              path="reports"
              element={
                <AuthorizedRoute allowedRoles={["owner", "admin", "accounting-manager", "treasury-officer", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"]}>
                  <FinancialReportsPage />
                </AuthorizedRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
      <ServerConfigDialog
        open={isServerModalOpen}
        onOpenChange={setIsServerModalOpen}
      />
    </Router>
  );
};

export default App;
