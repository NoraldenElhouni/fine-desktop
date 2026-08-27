import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  provisionUserAccount,
  GetEntitiesParams,
} from "../api/endpoints/entities";
import {
  getExternalEmployers,
  getExternalEmployer,
  createExternalEmployer,
  updateExternalEmployer,
  splitExternalEmployerEntity,
  relinkExternalEmployerEntity,
} from "../api/endpoints/externalEmployers";
import { getOperatingUnits } from "../api/endpoints/operatingUnits";
import {
  CreateEntityPayload,
  CreateExternalEmployerPayload,
} from "../types/entities";

export function useEntities(params?: GetEntitiesParams) {
  return useQuery({
    queryKey: ["entities", params],
    queryFn: () => getEntities(params),
  });
}

export function useEntity(id?: string) {
  return useQuery({
    queryKey: ["entity", id],
    queryFn: () => getEntity(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEntityPayload) => createEntity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useUpdateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateEntityPayload> & { record_version?: number };
    }) => updateEntity(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
      qc.invalidateQueries({ queryKey: ["entity"] });
    },
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
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

export function useSplitExternalEmployerEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { new_name?: string } }) =>
      splitExternalEmployerEntity(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["externalEmployers"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useRelinkExternalEmployerEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      targetEntityId,
    }: {
      id: string;
      targetEntityId: string;
    }) => relinkExternalEmployerEntity(id, { target_entity_id: targetEntityId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["externalEmployers"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useOperatingUnits() {
  return useQuery({
    queryKey: ["operatingUnits"],
    queryFn: () => getOperatingUnits(),
  });
}
