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
    <nav className="flex items-center justify-between px-5 py-2.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 text-xs select-none">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-zinc-100 tracking-tight text-xs uppercase">
          Fine Desktop
        </span>
        <div className="flex gap-1 text-xs font-medium">
          <Link
            to="/"
            className="px-2.5 py-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/users"
            className="px-2.5 py-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            Users
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-200">{user.name}</span>
            <span className="text-zinc-500">({user.email})</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
