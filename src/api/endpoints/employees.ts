import apiClient from "../client";
import { Employee, CreateEmployeePayload } from "../../types/entities";
import type { Paginated } from "./accounting";
import type { Attendance, Payslip, PayrollRunStatus } from "./hr";

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

export type EmployeePayslip = Payslip & {
  created_at?: string;
  payroll_run?: { id: string; period: string; status: PayrollRunStatus } | null;
};

export const getEmployeeAttendance = async (id: string, page = 1): Promise<Paginated<Attendance>> => {
  const response = await apiClient.get<Paginated<Attendance>>(`/employees/${id}/attendance`, { params: { page } });
  return response.data;
};

export const getEmployeePayslips = async (id: string, page = 1): Promise<Paginated<EmployeePayslip>> => {
  const response = await apiClient.get<Paginated<EmployeePayslip>>(`/employees/${id}/payslips`, { params: { page } });
  return response.data;
};
