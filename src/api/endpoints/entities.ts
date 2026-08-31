import apiClient from "../client";
import { Entity } from "../../types/entities";

export interface GetEntitiesParams {
  entity_type?: string;
  role_type?: string;
}

export const getEntities = async (params?: GetEntitiesParams): Promise<Entity[]> => {
  const response = await apiClient.get<{ data: Entity[] }>("/entities", { params });
  return response.data.data;
};

export const provisionUserAccount = async (
  id: string,
  email?: string,
  password?: string
): Promise<{ data: Entity; message?: string }> => {
  const response = await apiClient.post<{ data: Entity; message?: string }>(`/admin/entities/${id}/provision-user`, {
    email,
    password,
  });
  return response.data;
};
