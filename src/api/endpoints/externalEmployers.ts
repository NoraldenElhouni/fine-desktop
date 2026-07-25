import apiClient from "../client";
import { ExternalEmployer, CreateExternalEmployerPayload } from "../../types/entities";

export const getExternalEmployers = async (): Promise<ExternalEmployer[]> => {
  const response = await apiClient.get<{ data: ExternalEmployer[] }>("/external-employers");
  return response.data.data;
};

export const getExternalEmployer = async (id: string): Promise<ExternalEmployer> => {
  const response = await apiClient.get<{ data: ExternalEmployer }>(`/external-employers/${id}`);
  return response.data.data;
};

export const createExternalEmployer = async (
  payload: CreateExternalEmployerPayload
): Promise<ExternalEmployer> => {
  const response = await apiClient.post<{ data: ExternalEmployer }>("/external-employers", payload);
  return response.data.data;
};

export const updateExternalEmployer = async (
  id: string,
  payload: Partial<CreateExternalEmployerPayload>
): Promise<ExternalEmployer> => {
  const response = await apiClient.put<{ data: ExternalEmployer }>(`/external-employers/${id}`, payload);
  return response.data.data;
};
