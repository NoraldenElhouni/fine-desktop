import apiClient from "../client";
import {
  BlueprintEntry,
  Client,
  Employee,
  EntityType,
  OperatingUnit,
  OperatingUnitCreatePayload,
  OperatingUnitUpdatePayload,
  UnitBlueprintCreatePayload,
  UnitBlueprintUpdatePayload,
} from "../../types/entities";

export interface RoleEntry {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export const getOperatingUnits = async (
  options: { withTrashed?: boolean } = {},
): Promise<OperatingUnit[]> => {
  const response = await apiClient.get<{ data: OperatingUnit[] } | OperatingUnit[]>(
    "/operating-units",
    { params: options.withTrashed ? { with_trashed: 1 } : {} },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data ?? [];
};

export const getOperatingUnit = async (id: string): Promise<OperatingUnit> => {
  const response = await apiClient.get<{ data: OperatingUnit }>(`/operating-units/${id}`);
  return response.data.data;
};

export const createOperatingUnit = async (
  payload: OperatingUnitCreatePayload,
): Promise<OperatingUnit> => {
  const response = await apiClient.post<{ data: OperatingUnit }>("/operating-units", payload);
  return response.data.data;
};

export const updateOperatingUnit = async (
  id: string,
  payload: OperatingUnitUpdatePayload,
): Promise<OperatingUnit> => {
  const response = await apiClient.put<{ data: OperatingUnit }>(`/operating-units/${id}`, payload);
  return response.data.data;
};

export const deleteOperatingUnit = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/operating-units/${id}`);
  return response.data;
};

export const restoreOperatingUnit = async (id: string): Promise<OperatingUnit> => {
  const response = await apiClient.post<{ data: OperatingUnit }>(
    `/operating-units/${id}/restore`,
  );
  return response.data.data;
};

export const getUnitBlueprints = async (
  options: { withTrashed?: boolean } = {},
): Promise<BlueprintEntry[]> => {
  const response = await apiClient.get<{ data: BlueprintEntry[] } | BlueprintEntry[]>(
    "/unit-blueprints",
    { params: options.withTrashed ? { with_trashed: 1 } : {} },
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data ?? [];
};

export const getUnitBlueprint = async (id: string): Promise<BlueprintEntry> => {
  const response = await apiClient.get<{ data: BlueprintEntry }>(`/unit-blueprints/${id}`);
  return response.data.data;
};

export const createUnitBlueprint = async (
  payload: UnitBlueprintCreatePayload,
): Promise<BlueprintEntry> => {
  const response = await apiClient.post<{ data: BlueprintEntry }>(
    "/unit-blueprints",
    payload,
  );
  return response.data.data;
};

export const updateUnitBlueprint = async (
  id: string,
  payload: UnitBlueprintUpdatePayload,
): Promise<BlueprintEntry> => {
  const response = await apiClient.put<{ data: BlueprintEntry }>(
    `/unit-blueprints/${id}`,
    payload,
  );
  return response.data.data;
};

export const deleteUnitBlueprint = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/unit-blueprints/${id}`);
  return response.data;
};

export const restoreUnitBlueprint = async (id: string): Promise<BlueprintEntry> => {
  const response = await apiClient.post<{ data: BlueprintEntry }>(
    `/unit-blueprints/${id}/restore`,
  );
  return response.data.data;
};

// Re-export the role/entity/user/etc types that adjacent hooks/pages consume.
export type {
  BlueprintEntry,
  Client,
  Employee,
  EntityType,
  OperatingUnit,
  OperatingUnitCreatePayload,
  OperatingUnitUpdatePayload,
  UnitBlueprintCreatePayload,
  UnitBlueprintUpdatePayload,
};
