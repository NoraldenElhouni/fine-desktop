import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { useAuthStore } from "../../stores/authStore";
import { useLogoutMutation } from "../../hooks/useAuthQuery";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebarCollapsed();
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <div className="flex min-h-screen bg-app-bg-secondary" dir="rtl" lang="ar">
      <Sidebar
        isCollapsed={isCollapsed}
        activePath={location.pathname}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
        />
        <main className="flex-1 overflow-auto bg-app-bg-secondary p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
