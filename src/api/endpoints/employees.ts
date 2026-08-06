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

export const updateEmployee = async (
  id: string,
  payload: Partial<CreateEmployeePayload> & { record_version?: number }
): Promise<Employee> => {
  const response = await apiClient.put<{ data: Employee }>(`/employees/${id}`, payload);
  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/employees/${id}`);
  return response.data;
};

export const splitEmployeeEntity = async (
  id: string,
  payload?: { new_name?: string }
): Promise<Employee> => {
  const response = await apiClient.post<{ data: Employee }>(`/employees/${id}/split-entity`, payload || {});
  return response.data.data;
};

export const relinkEmployeeEntity = async (
  id: string,
  payload: { target_entity_id: string }
): Promise<Employee> => {
  const response = await apiClient.post<{ data: Employee }>(`/employees/${id}/relink-entity`, payload);
  return response.data.data;
};
