import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientSummary,
  getClientCreditLimitChanges,
  getClientAddresses,
  createClientAddress,
  updateClientAddress,
  deleteClientAddress,
  GetClientsParams,
  UpdateClientInput,
  ClientAddressPayload,
} from "../api/endpoints/clients";
import { CreateClientPayload } from "../types/entities";

export function useClients(params?: GetClientsParams, enabled = true) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => getClients(params),
    enabled,
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
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientInput }) => updateClient(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
      // A credit limit change writes a history row (W5-05).
      qc.invalidateQueries({ queryKey: ["clientCreditLimitChanges", id] });
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

// ── Client card (W5-05) ──────────────────────────────────────────────────────

/** Ledger balance, aging, overdue, last payment and open sales. */
export function useClientSummary(id?: string) {
  return useQuery({
    queryKey: ["clientSummary", id],
    queryFn: () => getClientSummary(id as string),
    enabled: Boolean(id),
  });
}

export function useClientCreditLimitChanges(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["clientCreditLimitChanges", id],
    queryFn: () => getClientCreditLimitChanges(id as string),
    enabled: Boolean(id) && enabled,
  });
}

export function useClientAddresses(clientId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["clientAddresses", clientId],
    queryFn: () => getClientAddresses(clientId as string),
    enabled: Boolean(clientId) && enabled,
  });
}

export function useCreateClientAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: ClientAddressPayload }) =>
      createClientAddress(clientId, payload),
    // Settled, not just success: an OPTIMISTIC_LOCK_CONFLICT must refresh record_version so a retry can succeed.
    onSettled: (_data, _err, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["clientAddresses", clientId] });
    },
  });
}

export function useUpdateClientAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      addressId,
      payload,
    }: {
      clientId: string;
      addressId: string;
      payload: Partial<ClientAddressPayload> & { record_version: number };
    }) => updateClientAddress(clientId, addressId, payload),
    // Settled, not just success: an OPTIMISTIC_LOCK_CONFLICT must refresh record_version so a retry can succeed.
    onSettled: (_data, _err, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["clientAddresses", clientId] });
    },
  });
}

export function useDeleteClientAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, addressId }: { clientId: string; addressId: string }) =>
      deleteClientAddress(clientId, addressId),
    // Settled, not just success: an OPTIMISTIC_LOCK_CONFLICT must refresh record_version so a retry can succeed.
    onSettled: (_data, _err, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["clientAddresses", clientId] });
    },
  });
}
