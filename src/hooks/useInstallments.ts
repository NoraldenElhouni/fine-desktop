import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { installmentsApi, InstallmentReportFilters } from "../api/endpoints/installments";

/** W5-08: installments across the unit's plans (GET /installments). */
export function useInstallments(filters?: InstallmentReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["installments", filters],
    queryFn: async () => (await installmentsApi.report(filters)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}
