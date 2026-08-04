import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import { ServerConnectionBanner } from "./ServerConnectionBanner";
import { ServerSettingsModal } from "../settings/ServerSettingsModal";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { useAuthStore } from "../../stores/authStore";
import { useLogoutMutation } from "../../hooks/useAuthQuery";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebarCollapsed();
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
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
    <div className="flex flex-col min-h-screen bg-app-bg-secondary" dir="rtl" lang="ar">
      <ServerConnectionBanner />

      <div className="flex min-w-0 flex-1">
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
            onOpenServerSettings={() => setIsServerSettingsOpen(true)}
          />
          <main className="flex-1 overflow-auto bg-app-bg-secondary p-6">
            {children}
          </main>
        </div>
      </div>

      <ServerSettingsModal
        isOpen={isServerSettingsOpen}
        onClose={() => setIsServerSettingsOpen(false)}
      />
    </div>
  );
};

export default AppShell;
