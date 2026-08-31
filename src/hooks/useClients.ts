import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  GetClientsParams,
} from "../api/endpoints/clients";
import { CreateClientPayload } from "../types/entities";

export function useClients(params?: GetClientsParams) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => getClients(params),
  });
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClient(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateClientPayload> & { record_version?: number };
    }) => updateClient(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
