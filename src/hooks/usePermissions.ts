import { useMemo } from "react";
import { useAuthStore } from "../stores/authStore";

const normalizeSlug = (slug: string): string =>
  slug.trim().toLowerCase().replace(/_/g, "-");

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const roleSlugs = useMemo<string[]>(() => {
    if (!user) return [];

    const slugs = new Set<string>();

    if (Array.isArray(user.role_slugs)) {
      user.role_slugs.forEach((s) => slugs.add(normalizeSlug(s)));
    }

    if (Array.isArray(user.roles)) {
      user.roles.forEach((r) => {
        if (r.slug) slugs.add(normalizeSlug(r.slug));
      });
    }

    return Array.from(slugs);
  }, [user]);

  const permissions = useMemo<string[]>(() => {
    if (!user || !Array.isArray(user.permissions)) return [];
    return user.permissions;
  }, [user]);

  const isOwner = useMemo<boolean>(() => {
    if (!user) return false;
    if (permissions.includes("*")) return true;
    return roleSlugs.some((slug) =>
      ["owner", "admin", "system-administrator", "superadmin"].includes(slug),
    );
  }, [user, permissions, roleSlugs]);

  const hasRole = (allowedRoles?: string[] | string): boolean => {
    if (!user) return false;
    if (isOwner) return true;
    if (!allowedRoles) return true;

    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (allowed.length === 0) return true;

    const normalizedAllowed = allowed.map(normalizeSlug);
    return roleSlugs.some((slug) => normalizedAllowed.includes(slug));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (isOwner) return true;
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const canAccess = (item?: { allowedRoles?: string[] }): boolean => {
    if (!item || !item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    return hasRole(item.allowedRoles);
  };

  return {
    user,
    roleSlugs,
    permissions,
    isOwner,
    hasRole,
    hasPermission,
    canAccess,
  };
}
