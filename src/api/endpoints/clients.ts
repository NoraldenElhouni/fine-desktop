import apiClient from "../client";
import { Client, CreateClientPayload } from "../../types/entities";

export interface GetClientsParams {
  operating_unit_id?: string;
  status?: string;
}

export const getClients = async (params?: GetClientsParams): Promise<Client[]> => {
  const response = await apiClient.get<{ data: Client[] }>("/clients", { params });
  return response.data.data;
};

export const getClient = async (id: string): Promise<Client> => {
  const response = await apiClient.get<{ data: Client }>(`/clients/${id}`);
  return response.data.data;
};

export const createClient = async (payload: CreateClientPayload): Promise<Client> => {
  const response = await apiClient.post<{ data: Client }>("/clients", payload);
  return response.data.data;
};

export const updateClient = async (
  id: string,
  payload: Partial<CreateClientPayload> & { record_version?: number }
): Promise<Client> => {
  const response = await apiClient.put<{ data: Client }>(`/clients/${id}`, payload);
  return response.data.data;
};

export const deleteClient = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/clients/${id}`);
  return response.data;
};
