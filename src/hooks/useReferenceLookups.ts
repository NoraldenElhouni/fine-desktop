import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LookupEntry } from "../config/referenceLookups";
import { referenceLookupsApi } from "../api/endpoints/referenceLookups";

export function useReferenceLookups(
  category: string,
  options: { search?: string; isActive?: boolean } = {},
) {
  return useQuery({
    queryKey: ["reference-lookups", category, options],
    queryFn: () => referenceLookupsApi.list(category, options),
    enabled: Boolean(category),
  });
}

export function useCreateReferenceLookup(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<LookupEntry, "id">) =>
      referenceLookupsApi.create(category, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reference-lookups", category],
      });
    },
  });
}

export function useUpdateReferenceLookup(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...entry
    }: {
      id: string | number;
    } & Partial<Omit<LookupEntry, "id">>) =>
      referenceLookupsApi.update(category, id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reference-lookups", category],
      });
    },
  });
}

export function useDeleteReferenceLookup(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      referenceLookupsApi.delete(category, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reference-lookups", category],
      });
    },
  });
}

export function useToggleReferenceLookupActive(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      referenceLookupsApi.toggleActive(category, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reference-lookups", category],
      });
    },
  });
}
