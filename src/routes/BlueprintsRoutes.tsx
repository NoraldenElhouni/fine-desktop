import { Routes, Route } from "react-router-dom";
import { BlueprintsPage } from "../pages/admin/BlueprintsPage";

const BlueprintsRoutes = () => (
  <Routes>
    <Route index element={<BlueprintsPage />} />
  </Routes>
);

export default BlueprintsRoutes;
