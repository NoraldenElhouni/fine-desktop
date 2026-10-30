import { useQuery, useQueries, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance,
  getEmployeePayslips,
  GetEmployeesParams,
} from "../api/endpoints/employees";
import { CreateEmployeePayload } from "../types/entities";
import type { Employee } from "../types/entities";

export function useEmployees(params?: GetEmployeesParams) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => getEmployees(params),
  });
}

/**
 * Employees a party picker may name. GET /employees keeps the pinned unit's scope
 * (X-Operating-Unit-ID) unless `operating_unit_id` is passed, which the backend honours
 * only for company-wide roles — and AppShell always pins a unit. So a company-wide caller
 * gets one request per unit (sharing `useEmployees({ operating_unit_id })`'s cache) merged
 * into one list; a unit caller gets their own unit's list.
 */
export function useEmployeesForParty(companyWide: boolean, unitIds: string[]) {
  const perUnit = useQueries({
    queries: (companyWide ? unitIds : []).map((operating_unit_id) => {
      const params: GetEmployeesParams = { operating_unit_id };
      return { queryKey: ["employees", params], queryFn: () => getEmployees(params) };
    }),
  });
  const own = useQuery({
    queryKey: ["employees", undefined],
    queryFn: () => getEmployees(),
    enabled: !companyWide,
  });

  if (!companyWide) {
    return { data: own.data ?? [], isLoading: own.isLoading };
  }
  const seen = new Set<string>();
  const data: Employee[] = [];
  for (const q of perUnit) {
    for (const emp of q.data ?? []) {
      if (seen.has(emp.id)) continue;
      seen.add(emp.id);
      data.push(emp);
    }
  }
  return { data, isLoading: perUnit.some((q) => q.isLoading) };
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

export function useEmployeeAttendance(id?: string, page = 1) {
  return useQuery({
    queryKey: ["employeeAttendance", id, page],
    queryFn: () => getEmployeeAttendance(id as string, page),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useEmployeePayslips(id?: string, page = 1) {
  return useQuery({
    queryKey: ["employeePayslips", id, page],
    queryFn: () => getEmployeePayslips(id as string, page),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}
