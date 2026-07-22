import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useLogoutMutation, useUserQuery } from "../../hooks/useAuthQuery";

export const NavigationBar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  useUserQuery();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <nav className="flex items-center justify-between px-5 py-2.5 bg-app-bg-primary border-b border-app-separator text-xs select-none">
      <div className="flex items-center gap-6">
        <span className="font-semibold tracking-tight text-xs uppercase text-app-label-primary">
          فاين ديسكتوب
        </span>
        <div className="flex gap-1 text-xs font-medium">
          <Link
            to="/"
            className="px-2.5 py-1 rounded text-app-label-tertiary hover:text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            لوحة التحكم
          </Link>
          <Link
            to="/users"
            className="px-2.5 py-1 rounded text-app-label-tertiary hover:text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            المستخدمون
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-xs text-app-label-secondary bg-app-bg-secondary px-2.5 py-1 rounded-md border border-app-separator">
            <UserIcon className="w-3.5 h-3.5 text-app-label-tertiary" />
            <span className="font-medium text-app-label-primary">
              {user.name}
            </span>
            <span className="text-app-label-tertiary" dir="ltr">
              ({user.email})
            </span>
            <span className="text-app-label-tertiary">
              ({user.roles?.map((role) => role.name).join(", ")})
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-1.5 text-xs text-app-label-tertiary hover:text-app-status-danger hover:bg-app-fill-f1 px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </nav>
  );
};
