import { ArrowRight, PanelLeftClose, PanelLeftOpen, Server } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteDisplayName } from "../../../hooks/useRouteDisplayName";
import { getBreadcrumbEntries } from "../../../routes/routes.config";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { useServerConfigStore } from "../../../stores/serverConfigStore";

interface NavbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenServerSettings?: () => void;
}

const Navbar = ({ isCollapsed, onToggleCollapse, onOpenServerSettings }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = useRouteDisplayName(location.pathname);
  const { isServerConnected } = useServerConfigStore();

  const breadcrumbItems = getBreadcrumbEntries(location.pathname, displayName);

  return (
    <header className="flex items-center justify-between border-b border-app-separator bg-app-bg-primary px-5 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-11 w-11 items-center justify-center rounded-app-xl border border-app-separator bg-app-bg-secondary text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary"
          aria-label={
            isCollapsed ? "توسيع الشريط الجانبي" : "تصغير الشريط الجانبي"
          }
        >
          {isCollapsed ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-app-xl border border-app-separator bg-app-bg-secondary text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary"
          aria-label="العودة"
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenServerSettings}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-app-xl border transition-all ${
            isServerConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
          }`}
          title="إعدادات السيرفر والشبكة"
        >
          <Server className="h-4 w-4" />
          <span>{isServerConnected ? "السيرفر متصل" : "غير متصل بالسيرفر"}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
