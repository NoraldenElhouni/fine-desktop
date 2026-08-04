import apiClient from "../client";
import { OperatingUnit } from "../../types/entities";

export const getOperatingUnits = async (): Promise<OperatingUnit[]> => {
  const response = await apiClient.get<{ data: OperatingUnit[] } | OperatingUnit[]>("/operating-units");
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.data ?? [];
};
