import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fiscalApi } from "../api/endpoints/fiscal";

export function useFiscalCalendar() {
  return useQuery({
    queryKey: ["fiscalCalendar"],
    queryFn: async () => (await fiscalApi.getCalendar()).data,
  });
}

function useFiscalMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fiscalCalendar"] }),
  });
}

export function useLockPeriod() {
  return useFiscalMutation(({ id, includeEarlier }: { id: string; includeEarlier: boolean }) =>
    fiscalApi.lockPeriod(id, includeEarlier),
  );
}

export function useReopenPeriod() {
  return useFiscalMutation(({ id, reason }: { id: string; reason: string }) => fiscalApi.reopenPeriod(id, reason));
}

export function useCreateFiscalYear() {
  return useFiscalMutation((startYear: number) => fiscalApi.createYear(startYear));
}

export function useUpdateFiscalSettings() {
  return useFiscalMutation((startMonth: number) => fiscalApi.updateSettings(startMonth));
}
