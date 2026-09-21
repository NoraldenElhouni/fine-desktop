import { ArrowRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteDisplayName } from "../../../hooks/useRouteDisplayName";
import { getBreadcrumbEntries } from "../../../routes/routes.config";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { useIsCompanyWide } from "../../../hooks/useAccounting";
import UnitSwitcher from "./UnitSwitcher";

interface NavbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Navbar = ({ isCollapsed, onToggleCollapse }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = useRouteDisplayName(location.pathname);
  const isCompanyWide = useIsCompanyWide();

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
        {isCompanyWide && <UnitSwitcher />}
      </div>
    </header>
  );
};

export default Navbar;
