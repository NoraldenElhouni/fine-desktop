import React from "react";
import { usePermissions } from "../hooks/usePermissions";
import { AccessDeniedPage } from "./AccessDeniedPage";

interface AuthorizedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { hasRole } = usePermissions();

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export default AuthorizedRoute;
