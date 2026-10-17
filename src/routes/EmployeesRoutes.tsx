import { Routes, Route } from "react-router-dom";
import { EmployeesPage } from "../pages/employees/EmployeesPage";
import { EmployeeDetailPage } from "../pages/employees/EmployeeDetailPage";

const EmployeesRoutes = () => (
  <Routes>
    <Route index element={<EmployeesPage />} />
    <Route path=":id" element={<EmployeeDetailPage />} />
  </Routes>
);

export default EmployeesRoutes;
