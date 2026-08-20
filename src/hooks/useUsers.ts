import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/endpoints/users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.list()).data.data,
  });
}

export function useRoleCatalog() {
  return useQuery({
    queryKey: ["roleCatalog"],
    queryFn: async () => (await usersApi.roleCatalog()).data.data,
  });
}

/** Every user mutation invalidates the one list this section renders. */
function useUserAction<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateUser() {
  return useUserAction(usersApi.create);
}

export function useUpdateUser() {
  return useUserAction(
    ({ id, ...data }: { id: string; name?: string; email?: string; is_active?: boolean; record_version: number }) =>
      usersApi.update(id, data),
  );
}

export function useAssignRole() {
  return useUserAction(
    ({ userId, roleId, operatingUnitId }: { userId: string; roleId: string; operatingUnitId: string | null }) =>
      usersApi.assignRole(userId, { role_id: roleId, operating_unit_id: operatingUnitId }),
  );
}

export function useRemoveRole() {
  return useUserAction(
    ({ userId, roleId, operatingUnitId }: { userId: string; roleId: string; operatingUnitId: string | null }) =>
      usersApi.removeRole(userId, roleId, operatingUnitId),
  );
}
