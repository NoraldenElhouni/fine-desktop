import apiClient from "../client";
import { Employee, CreateEmployeePayload } from "../../types/entities";

export interface GetEmployeesParams {
  operating_unit_id?: string;
  status?: string;
}

export const getEmployees = async (params?: GetEmployeesParams): Promise<Employee[]> => {
  const response = await apiClient.get<{ data: Employee[] }>("/employees", { params });
  return response.data.data;
};

export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.get<{ data: Employee }>(`/employees/${id}`);
  return response.data.data;
};

export const createEmployee = async (payload: CreateEmployeePayload): Promise<Employee> => {
  const response = await apiClient.post<{ data: Employee }>("/employees", payload);
  return response.data.data;
};

export function deleteEmployee(id: string) {
  return apiClient.delete<{ message: string }>(`/employees/${id}`);
}

export const updateEmployee = async (
  id: string,
  payload: Partial<CreateEmployeePayload> & { record_version?: number }
): Promise<Employee> => {
  const response = await apiClient.put<{ data: Employee }>(`/employees/${id}`, payload);
  return response.data.data;
};
