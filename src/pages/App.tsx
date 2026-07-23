import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginPage from "./auth/LoginPage";
import ChangePasswordPage from "./auth/ChangePasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./Dashboard";
import PlaceholderPage from "./PlaceholderPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="clients"
            element={
              <PlaceholderPage
                title="العملاء"
                description="سوف تُضاف هنا شاشة إدارة العملاء مع المحافظ والاتفاقيات والملفات ذات الصلة."
              />
            }
          />
          <Route
            path="clients/:id"
            element={
              <PlaceholderPage
                title="تفاصيل العميل"
                description="سيظهر هنا تفصيل العميل مع الطلبات والمهام والدفعات."
              />
            }
          />
          <Route
            path="orders"
            element={
              <PlaceholderPage
                title="الطلبات"
                description="سوف تُضاف هنا قائمة الطلبات مع أوضاع التنفيذ والتسليم."
              />
            }
          />
          <Route
            path="orders/:id"
            element={
              <PlaceholderPage
                title="تفاصيل الطلب"
                description="سيظهر هنا مخطط الطلب والمواد والمهام الإنتاجية."
              />
            }
          />
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
      </Routes>
    </Router>
  );
};

export default App;
