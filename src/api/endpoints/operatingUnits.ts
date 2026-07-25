import apiClient from "../client";
import { OperatingUnit } from "../../types/entities";

export const getOperatingUnits = async (): Promise<OperatingUnit[]> => {
  const response = await apiClient.get<{ data: OperatingUnit[] }>("/operating-units");
  return response.data.data;
};
