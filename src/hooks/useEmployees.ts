import { useQuery, useQueries, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance,
  getEmployeePayslips,
  getEmployeeCompensations,
  createEmployeeCompensation,
  deleteEmployeeCompensation,
  GetEmployeesParams,
  type CreateCompensationPayload,
} from "../api/endpoints/employees";
import { apiErrorPayload } from "../api/endpoints/production";
import { CreateEmployeePayload, type Employee, type UpdateEmployeePayload } from "../types/entities";

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
    // HR-14: the chosen shift was deleted meanwhile; refetch so the picker drops it.
    onError: (err) => {
      if (apiErrorPayload(err)?.errors?.work_shift_id) qc.invalidateQueries({ queryKey: ["workShifts"] });
    },
  });
}

/**
 * A hire-date correction moves the opening pay version (and may resync the current
 * terms and flag calculated payroll runs), so the salary history and payroll runs
 * refetch too. The PUT response (with the new record_version) is written straight
 * into the card's cache, and the mutation stays pending until the card has refetched,
 * so an edit opened right after a save never carries the old record_version. A 409
 * optimistic-lock conflict refetches the card for the same reason.
 */
export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => updateEmployee(id, payload),
    onSuccess: (data, { id, payload }) => {
      qc.setQueryData<Employee>(["employee", id], data);
      qc.invalidateQueries({ queryKey: ["employees"] });
      if (payload.hire_date !== undefined) {
        qc.invalidateQueries({ queryKey: ["employeeCompensations", id] });
        qc.invalidateQueries({ queryKey: ["payrollRuns"] });
      }
      return qc.invalidateQueries({ queryKey: ["employee", id] });
    },
    onError: (err, { id }) => {
      const payload = apiErrorPayload(err);
      if (payload?.code === "OPTIMISTIC_LOCK_CONFLICT") {
        qc.invalidateQueries({ queryKey: ["employee", id] });
        qc.invalidateQueries({ queryKey: ["employees"] });
      }
      // HR-14: the chosen shift was deleted meanwhile; refetch so the picker drops it.
      if (payload?.errors?.work_shift_id) qc.invalidateQueries({ queryKey: ["workShifts"] });
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

/** HR-11: the employee's pay history, newest first. */
export function useEmployeeCompensations(id?: string) {
  return useQuery({
    queryKey: ["employeeCompensations", id],
    queryFn: () => getEmployeeCompensations(id as string),
    enabled: Boolean(id),
  });
}

/**
 * A pay change rewrites the employee row's current terms (and so its record_version)
 * and may flag a calculated payroll run for recalculation. The mutation stays pending
 * until the employee card has refetched, so an edit opened right after carries the
 * new record_version.
 */
function useCompensationMutation<TArgs extends { employeeId: string }>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, { employeeId }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["payrollRuns"] });
      return Promise.all([
        qc.invalidateQueries({ queryKey: ["employeeCompensations", employeeId] }),
        qc.invalidateQueries({ queryKey: ["employee", employeeId] }),
      ]);
    },
  });
}

export function useCreateCompensation() {
  return useCompensationMutation(
    ({ employeeId, payload }: { employeeId: string; payload: CreateCompensationPayload }) =>
      createEmployeeCompensation(employeeId, payload),
  );
}

export function useDeleteCompensation() {
  return useCompensationMutation(
    ({ employeeId, compensationId }: { employeeId: string; compensationId: string }) =>
      deleteEmployeeCompensation(employeeId, compensationId),
  );
}
