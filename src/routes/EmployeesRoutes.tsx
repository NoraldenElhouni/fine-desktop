import { Routes, Route } from "react-router-dom";
import { EmployeesPage } from "../pages/employees/EmployeesPage";
import PlaceholderPage from "../pages/PlaceholderPage";

const EmployeesRoutes = () => (
  <Routes>
    <Route index element={<EmployeesPage />} />
    <Route
      path=":id"
      element={
        <PlaceholderPage
          title="تفاصيل الموظف"
          description="سيظهر هنا سجل الموظف، المسير المالي، والدوام."
        />
      }
    />
  </Routes>
);

export default EmployeesRoutes;
