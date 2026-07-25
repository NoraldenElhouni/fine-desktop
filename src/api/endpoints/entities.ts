import apiClient from "../client";
import { Entity, CreateEntityPayload } from "../../types/entities";

export interface GetEntitiesParams {
  entity_type?: string;
  role_type?: string;
}

export const getEntities = async (params?: GetEntitiesParams): Promise<Entity[]> => {
  const response = await apiClient.get<{ data: Entity[] }>("/entities", { params });
  return response.data.data;
};

export const getEntity = async (id: string): Promise<Entity> => {
  const response = await apiClient.get<{ data: Entity }>(`/entities/${id}`);
  return response.data.data;
};

export const createEntity = async (payload: CreateEntityPayload): Promise<Entity> => {
  const response = await apiClient.post<{ data: Entity }>("/entities", payload);
  return response.data.data;
};

export const updateEntity = async (
  id: string,
  payload: Partial<CreateEntityPayload> & { record_version?: number }
): Promise<Entity> => {
  const response = await apiClient.put<{ data: Entity }>(`/entities/${id}`, payload);
  return response.data.data;
};

export const deleteEntity = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/entities/${id}`);
  return response.data;
};

export const provisionUserAccount = async (
  id: string,
  email?: string
): Promise<{ data: Entity; message?: string }> => {
  const response = await apiClient.post<{ data: Entity }>(`/entities/${id}/provision-user`, {
    email,
  });
  return response.data;
};
