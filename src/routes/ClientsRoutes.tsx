import { Routes, Route } from "react-router-dom";
import ClientsPage from "../pages/clients/ClientsPage";
import PlaceholderPage from "../pages/PlaceholderPage";

const ClientsRoutes = () => (
  <Routes>
    <Route index element={<ClientsPage />} />
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
