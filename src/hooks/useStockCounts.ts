import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  stockCountsApi,
  AddFoundPayload,
  CreateStockCountPayload,
  StockCount,
  StockCountLineInput,
  StockCountListParams,
} from "../api/endpoints/stockCounts";

export function useStockCounts(params?: StockCountListParams) {
  return useQuery({
    queryKey: ["stockCounts", params],
    queryFn: async () => {
      const res = await stockCountsApi.list(params);
      return res.data;
    },
  });
}

export function useStockCount(id?: string) {
  return useQuery({
    queryKey: ["stockCount", id],
    queryFn: async () => {
      const res = await stockCountsApi.get(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useStockCountSheet(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["stockCountSheet", id],
    queryFn: async () => {
      const res = await stockCountsApi.sheet(id as string);
      return res.data;
    },
    enabled: Boolean(id) && enabled,
    // The sheet is printed from the count as it stands now.
    staleTime: 0,
  });
}

/** Every mutation answers with the presented count: put it straight into the cache. */
const storeCount = (queryClient: QueryClient, count: StockCount) => {
  queryClient.setQueryData(["stockCount", count.id], count);
  queryClient.invalidateQueries({ queryKey: ["stockCounts"] });
  queryClient.invalidateQueries({ queryKey: ["stockCountSheet", count.id] });
};

export function useCreateStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStockCountPayload) => (await stockCountsApi.create(data)).data,
    onSuccess: (count) => storeCount(queryClient, count),
  });
}

export function useUpdateStockCountLines() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lines }: { id: string; lines: StockCountLineInput[] }) =>
      (await stockCountsApi.updateLines(id, lines)).data,
    onSuccess: (count) => storeCount(queryClient, count),
  });
}

export function useAddFoundStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddFoundPayload }) =>
      (await stockCountsApi.addFound(id, data)).data,
    onSuccess: (count) => storeCount(queryClient, count),
  });
}

export function useSubmitStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await stockCountsApi.submit(id)).data,
    onSuccess: (count) => storeCount(queryClient, count),
  });
}

export function useApproveStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await stockCountsApi.approve(id)).data,
    onSuccess: (count) => {
      storeCount(queryClient, count);
      // Approval adjusts lots through movements and posts a journal entry.
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseStockSummary"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseLedger"] });
      queryClient.invalidateQueries({ queryKey: ["movementsForDocument"] });
      queryClient.invalidateQueries({ queryKey: ["stockMovementCard"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
    },
  });
}

export function useCancelStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await stockCountsApi.cancel(id)).data,
    onSuccess: (count) => storeCount(queryClient, count),
  });
}
