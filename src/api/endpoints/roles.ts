import apiClient from "../client";

export interface PermissionEntry {
  id: string;
  slug: string;
  name: string;
  module: string;
  action: string;
}

export interface RoleEntry {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  permission_ids?: string[] | null;
  pivot?: { operating_unit_id: string | null };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface RolePayload {
  name: string;
  slug?: string;
  description?: string | null;
  permission_ids?: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string | null;
  permission_ids?: string[];
}

export const rolesApi = {
  list: (options: { withTrashed?: boolean } = {}) =>
    apiClient.get<{ data: RoleEntry[] }>("/roles", {
      params: options.withTrashed ? { with_trashed: 1 } : {},
    }),

  show: (id: string, options: { withTrashed?: boolean } = {}) =>
    apiClient.get<{ data: RoleEntry }>(`/roles/${id}`, {
      params: options.withTrashed ? { with_trashed: 1 } : {},
    }),

  permissions: () =>
    apiClient.get<{ data: PermissionEntry[] }>("/permissions"),

  create: (data: RolePayload) =>
    apiClient.post<{ data: RoleEntry }>("/roles", data),

  update: (id: string, data: RoleUpdatePayload) =>
    apiClient.put<{ data: RoleEntry }>(`/roles/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/roles/${id}`),

  restore: (id: string) =>
    apiClient.post<{ data: RoleEntry }>(`/roles/${id}/restore`),
};
