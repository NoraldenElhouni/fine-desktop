import { useState, useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import { ServerConnectionBanner } from "./ServerConnectionBanner";
import { ServerSettingsModal } from "../settings/ServerSettingsModal";
import { ConflictModal } from "../ui/ConflictModal";
import { ToastContainer } from "../ui/Toast";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { useAuthStore } from "../../stores/authStore";
import { useLogoutMutation } from "../../hooks/useAuthQuery";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { useOperatingUnits } from "../../hooks/usePartners";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebarCollapsed();
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const { user } = useAuthStore();
  const { operatingUnitId, setOperatingUnitId } = useServerConfigStore();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: operatingUnits } = useOperatingUnits();

  useEffect(() => {
    if (!operatingUnitId && operatingUnits && operatingUnits.length > 0) {
      setOperatingUnitId(operatingUnits[0].id);
      return;
    }

    if (
      operatingUnitId &&
      operatingUnits &&
      !operatingUnits.some((u) => u.id === operatingUnitId)
    ) {
      setOperatingUnitId(null);
    }
  }, [operatingUnitId, operatingUnits, setOperatingUnitId]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-app-bg-secondary" dir="rtl" lang="ar">
      <ServerConnectionBanner />

      <div className="flex min-w-0 min-h-0 flex-1">
        <Sidebar
          isCollapsed={isCollapsed}
          activePath={location.pathname}
          user={user}
          onLogout={handleLogout}
          onOpenServerSettings={() => setIsServerSettingsOpen(true)}
        />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <Navbar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((value) => !value)}
            onOpenServerSettings={() => setIsServerSettingsOpen(true)}
          />
          <main className="flex-1 min-h-0 overflow-auto overscroll-contain bg-app-bg-secondary p-6">
            {children}
          </main>
        </div>
      </div>

      <ServerSettingsModal
        isOpen={isServerSettingsOpen}
        onClose={() => setIsServerSettingsOpen(false)}
      />

      <ConflictModal />
      <ToastContainer />
    </div>
  );
};

export default AppShell;
