// src/pages/app.tsx
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import UsersPage from "./users/UsersPage";

const App = () => {
  return (
    <Router>
      <nav className="flex gap-4 p-4 border-b">
        <Link to="/">Dashboard</Link>
        <Link to="/users">Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Router>
  );
};

export default App;
