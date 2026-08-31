import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  GetEmployeesParams,
} from "../api/endpoints/employees";
import { CreateEmployeePayload } from "../types/entities";

export function useEmployees(params?: GetEmployeesParams) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => getEmployees(params),
  });
}

export function useEmployee(id?: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateEmployeePayload> & { record_version?: number };
    }) => updateEmployee(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee"] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
