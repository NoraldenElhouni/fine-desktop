import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CLIENT_GROUP_WRITE_ROLES,
  createClientGroup,
  deleteClientGroup,
  getClientGroups,
  isClientGroupGone,
  updateClientGroup,
  type ClientGroupPayload,
} from "../api/endpoints/clientGroups";
import { apiErrorPayload } from "../api/endpoints/production";
import { useAuthStore } from "../stores/authStore";

/** W5-06: the company's client groups (read by everyone who works with clients). */
export function useClientGroups(enabled = true) {
  return useQuery({
    queryKey: ["clientGroups"],
    queryFn: getClientGroups,
    enabled,
  });
}

/**
 * A group change refreshes the list; clients refetch too since they carry the
 * group's code and name. A 409 conflict refetches so a reopened form reads the
 * new record_version instead of conflicting again; a 404 (another user deleted
 * the group) refetches so the stale row disappears.
 */
function useClientGroupMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientGroups"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
    onError: (err) => {
      if (apiErrorPayload(err)?.code === "OPTIMISTIC_LOCK_CONFLICT" || isClientGroupGone(err)) {
        qc.invalidateQueries({ queryKey: ["clientGroups"] });
      }
    },
  });
}

export function useCreateClientGroup() {
  return useClientGroupMutation((payload: ClientGroupPayload) => createClientGroup(payload));
}

export function useUpdateClientGroup() {
  return useClientGroupMutation(
    ({ id, payload }: { id: string; payload: Partial<ClientGroupPayload> & { record_version: number } }) =>
      updateClientGroup(id, payload),
  );
}

export function useDeleteClientGroup() {
  return useClientGroupMutation((id: string) => deleteClientGroup(id));
}

type RoleWithPivot = { slug?: string; pivot?: { operating_unit_id?: string | null } };

/**
 * Mirrors ClientGroupController::ensureCompanyWide: the owner role anywhere, or
 * a write role held company-wide. Admin passes the route's role check but not
 * this one, so usePermissions().hasRole is not enough here.
 */
export function useCanWriteClientGroups(): boolean {
  const user = useAuthStore((s) => s.user) as { roles?: RoleWithPivot[]; role_slugs?: string[] } | null;
  return useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase().replace(/_/g, "-");
    const writeRoles = CLIENT_GROUP_WRITE_ROLES.map(norm);
    const roles = user?.roles ?? [];
    const isOwner =
      roles.some((r) => r.slug && norm(r.slug) === "owner") ||
      (user?.role_slugs ?? []).some((s) => norm(s) === "owner");
    if (isOwner) return true;
    return roles.some(
      (r) => r.slug && writeRoles.includes(norm(r.slug)) && r.pivot !== undefined && r.pivot.operating_unit_id === null,
    );
  }, [user]);
}
