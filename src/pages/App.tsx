import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { NavigationBar } from "../components/layout/NavigationBar";
import LoginPage from "./auth/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import UsersPage from "./users/UsersPage";
import Dashboard from "./Dashboard";

const App = () => {
  return (
    <Router>
      <div className="bg-app-bg-primary text-app-label-primary border-app-separator">
        <NavigationBar />
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
