import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEntities,
  provisionUserAccount,
  GetEntitiesParams,
} from "../api/endpoints/entities";
import { getOperatingUnits } from "../api/endpoints/operatingUnits";

export function useEntities(params?: GetEntitiesParams) {
  return useQuery({
    queryKey: ["entities", params],
    queryFn: () => getEntities(params),
  });
}

export function useProvisionUserAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      email,
      password,
    }: {
      id: string;
      email?: string;
      password?: string;
    }) => provisionUserAccount(id, email, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useOperatingUnits() {
  return useQuery({
    queryKey: ["operatingUnits"],
    queryFn: () => getOperatingUnits(),
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
