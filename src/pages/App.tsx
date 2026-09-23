import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { X } from "lucide-react";
import Layout from "../components/layout/Layout";
import LoginPage from "./auth/LoginPage";
import ChangePasswordPage from "./auth/ChangePasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { ServerConfigDialog } from "../components/settings/ServerConfigDialog";
import { recordSystemVersion } from "../api/endpoints/system";
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

const getDesktopAppVersion = async (): Promise<string> => {
  if (typeof window !== "undefined" && window.electronAPI?.getAppVersion) {
    try {
      const v = await window.electronAPI.getAppVersion();
      if (v) return v;
    } catch {
      // fallback
    }
  }
  return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.24";
};

const App = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [versionHud, setVersionHud] = useState<{
    show: boolean;
    desktop: string;
    backend: string | null;
  } | null>(null);

  useEffect(() => {
    if (versionHud?.show) {
      const timer = setTimeout(() => {
        setVersionHud((prev) => (prev ? { ...prev, show: false } : null));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [versionHud?.show]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.code === "KeyS" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        setIsServerModalOpen((prev) => !prev);

        getDesktopAppVersion().then((dVer) => {
          setVersionHud({ show: true, desktop: dVer, backend: null });
          recordSystemVersion(dVer)
            .then((res) => {
              setVersionHud({ show: true, desktop: dVer, backend: res.backend_version });
            })
            .catch(() => {
              setVersionHud({ show: true, desktop: dVer, backend: "offline" });
            });
        });
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
      {versionHud?.show && (
        <div
          dir="ltr"
          className="fixed bottom-6 right-6 z-[999999] flex items-center gap-3 bg-neutral-900/95 text-white border border-neutral-700/80 shadow-2xl px-4 py-2.5 rounded-xl text-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-300">Fine ERP Build</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="font-mono flex items-center gap-2">
            <span>
              Desktop: <strong className="text-white">v{versionHud.desktop}</strong>
            </span>
            <span className="text-neutral-600">•</span>
            <span>
              Backend:{" "}
              <strong className={versionHud.backend === "offline" ? "text-rose-400" : "text-emerald-400"}>
                {versionHud.backend ? `v${versionHud.backend}` : "..."}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVersionHud(null)}
            className="ml-2 text-neutral-400 hover:text-white transition-colors p-0.5"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Router>
  );
};

export default App;
