import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEntities,
  provisionUserAccount,
  GetEntitiesParams,
} from "../api/endpoints/entities";
import {
  getExternalEmployers,
  getExternalEmployer,
  createExternalEmployer,
  updateExternalEmployer,
} from "../api/endpoints/externalEmployers";
import { getOperatingUnits } from "../api/endpoints/operatingUnits";
import { CreateExternalEmployerPayload } from "../types/entities";

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

export function useExternalEmployers() {
  return useQuery({
    queryKey: ["externalEmployers"],
    queryFn: () => getExternalEmployers(),
  });
}

export function useExternalEmployer(id?: string) {
  return useQuery({
    queryKey: ["externalEmployer", id],
    queryFn: () => getExternalEmployer(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateExternalEmployer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExternalEmployerPayload) =>
      createExternalEmployer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["externalEmployers"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useUpdateExternalEmployer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExternalEmployerPayload>;
    }) => updateExternalEmployer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["externalEmployers"] });
      qc.invalidateQueries({ queryKey: ["externalEmployer"] });
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
