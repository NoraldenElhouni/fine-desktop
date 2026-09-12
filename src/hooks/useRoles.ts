import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PermissionEntry,
  RoleEntry,
  RolePayload,
  RoleUpdatePayload,
  rolesApi,
} from "../api/endpoints/roles";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await rolesApi.list()).data.data,
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ["rolePermissions"],
    queryFn: async () => (await rolesApi.permissions()).data.data,
  });
}

function useRoleAction<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateRole() {
  return useRoleAction((payload: RolePayload) => rolesApi.create(payload));
}

export function useUpdateRole() {
  return useRoleAction(
    ({ id, ...data }: { id: string } & RoleUpdatePayload) =>
      rolesApi.update(id, data),
  );
}

export function useDeleteRole() {
  return useRoleAction((id: string) => rolesApi.delete(id));
}

export type { RoleEntry, PermissionEntry };
