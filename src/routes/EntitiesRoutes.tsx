import { Routes, Route } from "react-router-dom";
import { EntitiesListPage } from "../pages/entities/EntitiesListPage";
import PlaceholderPage from "../pages/PlaceholderPage";

const EntitiesRoutes = () => (
  <Routes>
    <Route index element={<EntitiesListPage />} />
    <Route
      path=":id"
      element={
        <PlaceholderPage
          title="تفاصيل الكيان"
          description="سيظهر هنا الملف الكامل للكيان والاتصالات والسجلات المرتبطة."
        />
      }
    />
  </Routes>
);

export default EntitiesRoutes;
