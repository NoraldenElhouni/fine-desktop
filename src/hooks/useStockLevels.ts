import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  stockLevelsApi,
  CreateItemStockLevelPayload,
  ReorderReportFilters,
  UpdateItemStockLevelPayload,
} from "../api/endpoints/stockLevels";

export function useItemStockLevels(params?: { inventory_item_id?: string; warehouse_id?: string }, enabled = true) {
  return useQuery({
    queryKey: ["itemStockLevels", params],
    queryFn: async () => {
      const res = await stockLevelsApi.list(params);
      return res.data;
    },
    enabled,
  });
}

export function useReorderReport(filters?: ReorderReportFilters, enabled = true) {
  return useQuery({
    queryKey: ["reorderReport", filters],
    queryFn: async () => {
      const res = await stockLevelsApi.reorderReport(filters);
      return res.data;
    },
    enabled,
  });
}

/** Limits feed the reorder report and the dashboard's low-stock count. */
const refreshLevels = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["itemStockLevels"] });
  queryClient.invalidateQueries({ queryKey: ["reorderReport"] });
  queryClient.invalidateQueries({ queryKey: ["dashboardKpis"] });
};

export function useCreateItemStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateItemStockLevelPayload) => (await stockLevelsApi.create(data)).data,
    onSuccess: () => refreshLevels(queryClient),
  });
}

export function useUpdateItemStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateItemStockLevelPayload }) =>
      (await stockLevelsApi.update(id, data)).data,
    onSuccess: () => refreshLevels(queryClient),
  });
}

export function useDeleteItemStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockLevelsApi.remove(id),
    onSuccess: () => refreshLevels(queryClient),
  });
}
