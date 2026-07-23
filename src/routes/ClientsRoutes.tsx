import { Routes, Route } from "react-router-dom";
import PlaceholderPage from "../pages/PlaceholderPage";

const ClientsRoutes = () => (
  <Routes>
    <Route
      index
      element={
        <PlaceholderPage
          title="العملاء"
          description="سوف تُضاف هنا شاشة إدارة العملاء مع المحافظ والاتفاقيات والملفات ذات الصلة."
        />
      }
    />
    <Route
      path=":id"
      element={
        <PlaceholderPage
          title="تفاصيل العميل"
          description="سيظهر هنا تفصيل العميل مع الطلبات والمهام والدفعات."
        />
      }
    />
  </Routes>
);

export default ClientsRoutes;
