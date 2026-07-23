import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Factory, LogOut, Settings, UserRound } from "lucide-react";
import { User } from "../../../types/auth/types";
import { cn } from "../../../lib/utils/utils";
import { tokens } from "../../../lib/tokens";
import { navItems } from "../../../routes/routes.config";

interface SidebarProps {
  isCollapsed: boolean;
  activePath: string;
  user: User | null;
  onLogout: () => void;
}

const Sidebar = ({ isCollapsed, activePath, user, onLogout }: SidebarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        "flex h-screen flex-col border-e border-app-separator bg-app-bg-primary/95 backdrop-blur-sm transition-all duration-200",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-app-separator px-4 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-app-xl bg-app-accent-subtle text-app-accent">
          <Factory className="h-5 w-5" />
        </div>
        {!isCollapsed ? (
          <div className="min-w-0">
            <p
              className={cn(
                tokens.typography.webUI.b1Emphasized,
                "truncate text-app-label-primary",
              )}
            >
              فاين للإنتاج
            </p>
            <p
              className={cn(
                tokens.typography.webUI.c1Regular,
                "truncate text-app-label-secondary",
              )}
            >
              ERP التصنيع
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? activePath === "/"
                : activePath === item.path ||
                  activePath.startsWith(`${item.path}/`);

            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-app-xl px-3 py-2 text-start transition-all duration-200",
                    isCollapsed ? "justify-center" : "gap-3",
                    isActive
                      ? "bg-app-accent-subtle text-app-accent"
                      : "text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-app-lg",
                      isActive ? "bg-app-accent-tint" : "bg-app-bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isCollapsed ? (
                    <span
                      className={cn(
                        tokens.typography.webUI.b2Regular,
                        "truncate",
                      )}
                    >
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-app-separator px-3 py-2.5">
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
                "absolute bottom-full rounded-app-xl border border-app-separator bg-app-bg-primary py-2 px-3 shadow-sm",
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
