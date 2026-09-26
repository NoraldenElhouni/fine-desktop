import apiClient from "../client";
import { LookupEntry } from "../../config/referenceLookups";

export interface ServerReferenceLookup {
  id: number | string;
  category: string;
  name: string;
  code: string;
  is_active: boolean;
  notes?: string | null;
  fields?: Record<string, string> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReferenceLookupPayload {
  name?: string;
  code?: string;
  is_active?: boolean;
  notes?: string | null;
  fields?: Record<string, string>;
}

export const toLookupEntry = (item: ServerReferenceLookup): LookupEntry => ({
  id: String(item.id),
  name: item.name,
  code: item.code,
  isActive: Boolean(item.is_active),
  notes: item.notes ?? undefined,
  fields: item.fields ?? {},
});

export const referenceLookupsApi = {
  list: async (
    category: string,
    options: { search?: string; isActive?: boolean } = {},
  ): Promise<LookupEntry[]> => {
    const params: Record<string, string | number> = {};
    if (options.search) {
      params.search = options.search;
    }
    if (typeof options.isActive === "boolean") {
      params.is_active = options.isActive ? 1 : 0;
    }

    const response = await apiClient.get<ServerReferenceLookup[]>(
      `/reference-lookups/${category}`,
      { params },
    );

    return (response.data ?? []).map(toLookupEntry);
  },

  show: async (category: string, id: string | number): Promise<LookupEntry> => {
    const response = await apiClient.get<ServerReferenceLookup>(
      `/reference-lookups/${category}/${id}`,
    );
    return toLookupEntry(response.data);
  },

  create: async (
    category: string,
    entry: Omit<LookupEntry, "id">,
  ): Promise<LookupEntry> => {
    const payload: ReferenceLookupPayload = {
      name: entry.name,
      code: entry.code,
      is_active: entry.isActive,
      notes: entry.notes ?? null,
      fields: entry.fields,
    };

    const response = await apiClient.post<ServerReferenceLookup>(
      `/reference-lookups/${category}`,
      payload,
    );

    return toLookupEntry(response.data);
  },

  update: async (
    category: string,
    id: string | number,
    entry: Partial<Omit<LookupEntry, "id">>,
  ): Promise<LookupEntry> => {
    const payload: ReferenceLookupPayload = {
      name: entry.name,
      code: entry.code,
      is_active: entry.isActive,
      notes: entry.notes,
      fields: entry.fields,
    };

    const response = await apiClient.put<ServerReferenceLookup>(
      `/reference-lookups/${category}/${id}`,
      payload,
    );

    return toLookupEntry(response.data);
  },

  delete: async (
    category: string,
    id: string | number,
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/reference-lookups/${category}/${id}`,
    );
    return response.data;
  },

  toggleActive: async (
    category: string,
    id: string | number,
  ): Promise<LookupEntry> => {
    const response = await apiClient.patch<ServerReferenceLookup>(
      `/reference-lookups/${category}/${id}/toggle-active`,
    );
    return toLookupEntry(response.data);
  },
};
