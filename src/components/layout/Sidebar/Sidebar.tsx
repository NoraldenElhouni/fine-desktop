import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, UserRound, LayoutGrid, ChevronDown, ChevronRight } from "lucide-react";
import { FineLogo } from "../../../assets/logo";
import { User } from "../../../types/auth/types";
import { cn } from "../../../lib/utils/utils";
import { tokens } from "../../../lib/tokens";
import { categoryGroups, CategoryGroup } from "../../../routes/categories.config";
import { usePermissions } from "../../../hooks/usePermissions";

interface SidebarProps {
  isCollapsed: boolean;
  activePath: string;
  user: User | null;
  onLogout: () => void;
}

const Sidebar = ({ isCollapsed, activePath, user, onLogout }: SidebarProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const { canAccess } = usePermissions();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const displayName = useMemo(() => {
    if (!user?.name) {
      return "المستخدم";
    }

    return user.name.split(" ")[0] ?? user.name;
  }, [user?.name]);

  const roles = user?.roles ?? [];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-e border-app-separator bg-app-bg-primary/95 backdrop-blur-sm transition-all duration-200",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-20 items-center justify-center border-b border-app-separator px-4 transition-all duration-200">
        <img
          src={FineLogo}
          alt="فاين"
          className={cn(
            "object-contain transition-all duration-200",
            isCollapsed ? "h-12 w-12" : "h-16 w-auto max-w-[160px]",
          )}
        />
      </div>

      <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-1">
        {/* Main Dashboard Link */}
        <Link
          to="/"
          className={cn(
            "flex items-center rounded-app-xl px-3 py-2 text-start transition-all duration-200 mb-2",
            isCollapsed ? "justify-center" : "gap-3",
            activePath === "/"
              ? "bg-app-accent-subtle text-app-accent"
              : "text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-app-lg shrink-0",
              activePath === "/" ? "bg-app-accent-tint" : "bg-app-bg-secondary",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </span>
          {!isCollapsed ? (
            <span className={cn(tokens.typography.webUI.b2Emphasized, "truncate")}>
              لوحة التحكم الرئيسية
            </span>
          ) : null}
        </Link>

        {/* Category Groups Accordions */}
        {categoryGroups.map((cat: CategoryGroup) => {
          const visibleItems = cat.items.filter((item) => canAccess(item));
          if (visibleItems.length === 0) {
            return null;
          }

          const isCategoryHubActive = activePath === cat.path;
          const isChildActive = visibleItems.some(
            (item) => activePath === item.path || activePath.startsWith(`${item.path}/`),
          );
          const isExpanded = expandedCategories[cat.id] || isCategoryHubActive || isChildActive;
          const CategoryIcon = cat.icon;

          return (
            <div key={cat.id} className="space-y-1">
              <div
                className={cn(
                  "flex items-center justify-between rounded-app-xl px-3 py-2 text-start transition-all duration-200 cursor-pointer",
                  isCategoryHubActive || isChildActive
                    ? "bg-app-accent-subtle/50 text-app-accent font-bold"
                    : "text-app-label-primary hover:bg-app-fill-f1",
                )}
              >
                <Link
                  to={cat.path}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-app-lg shrink-0",
                      isCategoryHubActive || isChildActive
                        ? "bg-app-accent-subtle text-app-accent"
                        : "bg-app-bg-secondary text-app-label-secondary",
                    )}
                  >
                    <CategoryIcon className="h-4 w-4" />
                  </span>
                  {!isCollapsed ? (
                    <span
                      className={cn(tokens.typography.webUI.c1Emphasized, "truncate")}
                    >
                      {cat.label}
                    </span>
                  ) : null}
                </Link>

                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`sidebar-cat-${cat.id}`}
                    className="p-1 text-app-label-tertiary hover:text-app-label-primary transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : null}
              </div>

              {/* Collapsible Sub-Items */}
              {!isCollapsed && isExpanded ? (
                <div
                  id={`sidebar-cat-${cat.id}`}
                  className="ms-4 space-y-0.5 border-s border-app-separator ps-2 py-0.5"
                >
                  {visibleItems.map((item) => {
                    const isItemActive =
                      activePath === item.path || activePath.startsWith(`${item.path}/`);
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2 rounded-app-lg px-2.5 py-1.5 text-xs text-start transition-colors",
                          isItemActive
                            ? "bg-app-accent text-white font-bold shadow-sm"
                            : "text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary",
                        )}
                      >
                        <ItemIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-app-separator px-3 py-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className={cn(
              "flex w-full items-center rounded-app-xl border border-app-separator bg-app-bg-secondary text-start transition-colors hover:bg-app-fill-f1",
              isCollapsed ? "justify-center p-1.5" : "gap-3 px-3 py-2",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-accent-subtle text-app-accent ring-2 ring-app-bg-primary">
              <UserRound className="h-3.5 w-3.5" />
            </div>
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    tokens.typography.webUI.b2Emphasized,
                    "truncate text-app-label-primary",
                  )}
                >
                  {displayName}
                </p>
                {roles.length > 0 ? (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <span
                        key={role.id}
                        className={cn(
                          tokens.typography.webUI.c1Emphasized,
                          "rounded-full bg-app-accent-subtle px-1.5 py-0 text-app-accent",
                        )}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className={cn(
                      tokens.typography.webUI.c1Regular,
                      "truncate text-app-label-secondary",
                    )}
                  >
                    الملف الشخصي
                  </p>
                )}
              </div>
            ) : null}
          </button>
          {isMenuOpen ? (
            <div
              className={cn(
                "absolute bottom-full rounded-app-xl border border-app-separator bg-app-bg-primary py-2 px-3 shadow-sm transition-opacity duration-200",
                isCollapsed
                  ? "start-0 mb-1 flex -translate-x-0 flex-col items-center gap-2"
                  : "mb-2 w-full",
              )}
            >
              <button
                type="button"
                title="الإعدادات"
                aria-label="الإعدادات"
                className={cn(
                  "flex items-center text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary",
                  isCollapsed
                    ? "h-8 w-8 justify-center rounded-app-lg"
                    : "w-full gap-2 rounded-app-lg px-3 py-2 text-start",
                )}
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings className="h-3.5 w-3.5" />
                {!isCollapsed ? (
                  <span className={cn(tokens.typography.webUI.b2Regular)}>
                    الإعدادات
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                title="تسجيل الخروج"
                aria-label="تسجيل الخروج"
                className={cn(
                  "flex items-center text-app-status-danger transition-colors hover:bg-app-fill-f1",
                  isCollapsed
                    ? "h-8 w-8 justify-center rounded-app-lg"
                    : "mt-1 w-full gap-2 rounded-app-lg px-3 py-2 text-start",
                )}
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                {!isCollapsed ? (
                  <span className={cn(tokens.typography.webUI.b2Regular)}>
                    تسجيل الخروج
                  </span>
                ) : null}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
