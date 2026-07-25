import { Routes, Route } from "react-router-dom";
import { ExternalEmployersPage } from "../pages/entities/ExternalEmployersPage";
import PlaceholderPage from "../pages/PlaceholderPage";

const ExternalEmployersRoutes = () => (
  <Routes>
    <Route index element={<ExternalEmployersPage />} />
    <Route
      path=":id"
      element={
        <PlaceholderPage
          title="تفاصيل الجهة المشغلة"
          description="سيظهر هنا عقد الجهة، محفظة العمالة الموردة، والدفعات المستحقة."
        />
      }
    />
  </Routes>
);

export default ExternalEmployersRoutes;
