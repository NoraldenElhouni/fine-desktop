import apiClient from "../client";

export interface UserRolePivot {
  operating_unit_id: string | null;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  record_version: number;
  roles?: import("./roles").RoleEntry[];
  created_at?: string;
  deleted_at?: string | null;
}

export const usersApi = {
  list: (options: { withTrashed?: boolean } = {}) =>
    apiClient.get<{ data: AppUser[] }>("/users", {
      params: options.withTrashed ? { with_trashed: 1 } : {},
    }),

  create: (data: { name: string; email: string; password: string }) =>
    apiClient.post<{ data: AppUser }>("/users", data),

  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      is_active?: boolean;
      record_version: number;
    },
  ) => apiClient.put<{ data: AppUser }>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/users/${id}`),

  restore: (id: string) =>
    apiClient.post<{ data: AppUser }>(`/users/${id}/restore`),

  assignRole: (userId: string, data: { role_id: string; operating_unit_id?: string | null }) =>
    apiClient.post<{ message: string }>(`/users/${userId}/roles/assign`, data),

  removeRole: (userId: string, roleId: string, operatingUnitId: string | null) =>
    apiClient.delete<{ message: string }>(`/users/${userId}/roles/${roleId}`, {
      data: { operating_unit_id: operatingUnitId },
    }),
};
