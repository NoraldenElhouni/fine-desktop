import { Routes, Route } from "react-router-dom";
import { ClientsPage } from "../pages/clients/ClientsPage";
import { ClientDetailPage } from "../pages/clients/ClientDetailPage";

const ClientsRoutes = () => (
  <Routes>
    <Route index element={<ClientsPage />} />
    <Route path=":id" element={<ClientDetailPage />} />
  </Routes>
);

export default ClientsRoutes;
