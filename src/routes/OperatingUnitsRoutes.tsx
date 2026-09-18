import { Routes, Route } from "react-router-dom";
import { OperatingUnitsPage } from "../pages/admin/OperatingUnitsPage";
import { OperatingUnitDetailPage } from "../pages/admin/OperatingUnitDetailPage";

const OperatingUnitsRoutes = () => (
  <Routes>
    <Route index element={<OperatingUnitsPage />} />
    <Route path=":id" element={<OperatingUnitDetailPage />} />
  </Routes>
);

export default OperatingUnitsRoutes;
