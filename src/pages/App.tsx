import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginPage from "./auth/LoginPage";
import ChangePasswordPage from "./auth/ChangePasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./Dashboard";
import { FinancialReportsPage } from "./accounting/FinancialReportsPage";
import OrdersRoutes from "../routes/OrdersRoutes";
import UsersRoutes from "../routes/UsersRoutes";
import ClientsRoutes from "../routes/ClientsRoutes";
import EntitiesRoutes from "../routes/EntitiesRoutes";
import EmployeesRoutes from "../routes/EmployeesRoutes";
import ExternalEmployersRoutes from "../routes/ExternalEmployersRoutes";
import { InventoryRoutes } from "../routes/InventoryRoutes";
import { ManufacturingRoutes } from "../routes/ManufacturingRoutes";
import { CutterRoutes } from "../routes/CutterRoutes";
import { FurnitureRoutes } from "../routes/FurnitureRoutes";
import { SalesRoutes } from "../routes/SalesRoutes";
import { AccountingRoutes } from "../routes/AccountingRoutes";

import SuppliersPage from "./procurement/SuppliersPage";
import ImportOrdersPage from "./procurement/ImportOrdersPage";
import TreasuryPage from "./treasury/TreasuryPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="entities/*" element={<EntitiesRoutes />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="import-orders" element={<ImportOrdersPage />} />
            <Route path="treasury" element={<TreasuryPage />} />
            <Route path="employees/*" element={<EmployeesRoutes />} />
            <Route path="clients/*" element={<ClientsRoutes />} />
            <Route path="external-employers/*" element={<ExternalEmployersRoutes />} />
            <Route path="orders/*" element={<OrdersRoutes />} />
            <Route path="users/*" element={<UsersRoutes />} />
            <Route path="inventory/*" element={<InventoryRoutes />} />
            <Route path="manufacturing/*" element={<ManufacturingRoutes />} />
            <Route path="cutter/*" element={<CutterRoutes />} />
            <Route path="furniture/*" element={<FurnitureRoutes />} />
            <Route path="sales/*" element={<SalesRoutes />} />
            <Route path="accounting/*" element={<AccountingRoutes />} />
            <Route path="reports" element={<FinancialReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
