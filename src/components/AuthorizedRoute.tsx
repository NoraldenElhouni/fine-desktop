import React from "react";
import { useLocation } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { navItems } from "../routes/routes.config";
import { AccessDeniedPage } from "./AccessDeniedPage";

interface AuthorizedRouteProps {
  allowedRoles?: string[];
  /** View permission; defaults to the permission of the sidebar item owning this path. */
  permission?: string;
  children?: React.ReactNode;
}

/** The sidebar item whose path is the longest prefix of the current location. */
const navPermissionFor = (pathname: string): string | undefined =>
  navItems
    .filter((item) => item.path !== "/" && (pathname === item.path || pathname.startsWith(`${item.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]?.permission;

export const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({
  allowedRoles,
  permission,
  children,
}) => {
  const { hasRole, hasPermission } = usePermissions();
  const { pathname } = useLocation();

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDeniedPage />;
  }

  const required = permission ?? navPermissionFor(pathname);
  if (required && !hasPermission(required)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export default AuthorizedRoute;
