import { Routes, Route } from "react-router-dom";
import PlaceholderPage from "../pages/PlaceholderPage";

const OrdersRoutes = () => (
  <Routes>
    <Route
      index
      element={
        <PlaceholderPage
          title="الطلبات"
          description="سوف تُضاف هنا قائمة الطلبات مع أوضاع التنفيذ والتسليم."
        />
      }
    />
    <Route
      path=":id"
      element={
        <PlaceholderPage
          title="تفاصيل الطلب"
          description="سيظهر هنا مخطط الطلب والمواد والمهام الإنتاجية."
        />
      }
    />
  </Routes>
);

export default OrdersRoutes;
