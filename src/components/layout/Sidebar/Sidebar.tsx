import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  KeyRound,
  LayoutGrid,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { canAccess } = usePermissions();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [isCollapsed]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return (
    <aside
      className={cn(
        "relative z-20 flex h-full flex-col border-e border-app-separator bg-app-bg-primary/95 backdrop-blur-sm transition-all duration-200",
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
                    className="p-1 text-app-label-tertiary hover:text-app-label-primary transition-colors cursor-pointer"
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
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((value) => !value);
            }}
            className={cn(
              "flex w-full items-center rounded-app-xl border border-app-separator bg-app-bg-secondary text-start cursor-pointer select-none transition-all hover:bg-app-accent-subtle/50 hover:border-app-accent/40 active:scale-[0.99]",
              isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
            )}
            title={isCollapsed ? (user?.name || "المستخدم") : undefined}
          >
            <div className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-accent-subtle text-app-accent ring-2 ring-app-bg-primary">
              <UserRound className="h-4 w-4" />
            </div>
            {!isCollapsed ? (
              <>
                <div className="pointer-events-none min-w-0 flex-1">
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
                      {roles.map((role, idx) => {
                        const roleName =
                          typeof role === "string" ? role : role?.name || role?.slug;
                        const roleKey =
                          typeof role === "object" && role?.id ? role.id : idx;
                        if (!roleName) return null;
                        return (
                          <span
                            key={roleKey}
                            className={cn(
                              tokens.typography.webUI.c1Emphasized,
                              "rounded-full bg-app-accent-subtle px-1.5 py-0 text-app-accent text-[11px]",
                            )}
                          >
                            {roleName}
                          </span>
                        );
                      })}
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
                <div className="pointer-events-none shrink-0 text-app-label-tertiary">
                  {isMenuOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </>
            ) : null}
          </button>
          {isMenuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              className={cn(
                "absolute bottom-full mb-2 z-50 rounded-app-xl border border-app-separator bg-app-bg-primary p-2 shadow-app-modal",
                isCollapsed ? "start-0 w-60" : "inset-x-0 w-full",
              )}
            >
              <div className="border-b border-app-separator px-2.5 pb-2 pt-1">
                <p
                  className={cn(
                    tokens.typography.webUI.b2Emphasized,
                    "truncate text-app-label-primary",
                  )}
                >
                  {user?.name || "المستخدم"}
                </p>
                {user?.email ? (
                  <p
                    className={cn(
                      tokens.typography.webUI.c1Regular,
                      "truncate text-app-label-secondary text-[11px] mt-0.5",
                    )}
                  >
                    {user.email}
                  </p>
                ) : null}
                {roles.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {roles.map((role, idx) => {
                      const roleName =
                        typeof role === "string" ? role : role?.name || role?.slug;
                      const roleKey =
                        typeof role === "object" && role?.id ? role.id : idx;
                      if (!roleName) return null;
                      return (
                        <span
                          key={roleKey}
                          className={cn(
                            tokens.typography.webUI.c1Emphasized,
                            "rounded-full bg-app-accent-subtle px-1.5 py-0.5 text-app-accent text-[11px]",
                          )}
                        >
                          {roleName}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-app-lg px-2.5 py-2 text-start text-xs font-medium text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary"
                >
                  <Settings className="h-4 w-4 shrink-0 text-app-label-tertiary" />
                  <span>الإعدادات</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/change-password");
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-app-lg px-2.5 py-2 text-start text-xs font-medium text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary"
                >
                  <KeyRound className="h-4 w-4 shrink-0 text-app-label-tertiary" />
                  <span>تغيير كلمة المرور</span>
                </button>

                <div className="my-1 border-t border-app-separator" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-app-lg px-2.5 py-2 text-start text-xs font-medium text-app-status-danger transition-colors hover:bg-app-status-danger/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
