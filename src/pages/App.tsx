import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginPage from "./auth/LoginPage";
import ChangePasswordPage from "./auth/ChangePasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./Dashboard";
import PlaceholderPage from "./PlaceholderPage";
import OrdersRoutes from "../routes/OrdersRoutes";
import UsersRoutes from "../routes/UsersRoutes";
import ClientsRoutes from "../routes/ClientsRoutes";
import EntitiesRoutes from "../routes/EntitiesRoutes";
import EmployeesRoutes from "../routes/EmployeesRoutes";
import ExternalEmployersRoutes from "../routes/ExternalEmployersRoutes";

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
            <Route
              path="inventory"
              element={
                <PlaceholderPage
                  title="المخزون"
                  description="سوف تُضاف هنا شاشة إدارة المواد الخام والمنتجات نصف المصنعة."
                />
              }
            />
            <Route
              path="manufacturing"
              element={
                <PlaceholderPage
                  title="التصنيع"
                  description="سوف تُضاف هنا متابعة خطوط الإنتاج والعمليات والمهام."
                />
              }
            />
            <Route
              path="sales"
              element={
                <PlaceholderPage
                  title="المبيعات"
                  description="سوف تُضاف هنا شاشة المبيعات والطلبات المؤكدة والتسعير."
                />
              }
            />
            <Route
              path="reports"
              element={
                <PlaceholderPage
                  title="التقارير"
                  description="سوف تُعرض هنا مؤشرات الأداء الرئيسية والبيانات التشغيلية."
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
