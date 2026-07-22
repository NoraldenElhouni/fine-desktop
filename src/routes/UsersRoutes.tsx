// src/pages/UsersRoutes.tsx
import { Routes, Route } from "react-router-dom";
import UsersPage from "../pages/users/UsersPage";
import UserDetail from "../pages/users/UserDetail";

const UsersRoutes = () => (
  <Routes>
    <Route index element={<UsersPage />} />
    <Route path=":id" element={<UserDetail />} />
  </Routes>
);

export default UsersRoutes;
