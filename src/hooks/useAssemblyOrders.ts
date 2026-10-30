import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  assemblyOrdersApi,
  AssemblyOrder,
  AssemblyOrderListParams,
  CreateAssemblyOrderPayload,
} from "../api/endpoints/assemblyOrders";
import { inventoryApi } from "../api/endpoints/inventory";
import type { StockLot } from "../api/endpoints/inventory";
import { productionApi } from "../api/endpoints/production";

export function useAssemblyOrders(params?: AssemblyOrderListParams) {
  return useQuery({
    queryKey: ["assemblyOrders", params],
    queryFn: async () => (await assemblyOrdersApi.list(params)).data,
  });
}

export function useAssemblyOrder(id?: string) {
  return useQuery({
    queryKey: ["assemblyOrder", id],
    queryFn: async () => (await assemblyOrdersApi.get(id as string)).data,
    enabled: Boolean(id),
  });
}

/** Pages of lots fetched per component before the list is reported as cut short. */
const MAX_LOT_PAGES = 20;

export interface AssemblyComponentLots {
  /** Lots an order can draw (or may, see `unverified`), oldest first. */
  lots: StockLot[];
  /**
   * Ids of lots from a foam production batch whose status could not be
   * confirmed as closed: the batches list is outside the caller's roles, or
   * the batch was not in it (another unit's batch on a transferred lot, a
   * deleted batch, or one past the page cap). The backend draws such a lot
   * only once its batch is closed.
   */
  unverified: Set<string>;
  /** Lots left out because their production batch is not closed yet. */
  excludedOpenBatch: number;
  /** True when the component holds more lots than were fetched. */
  truncated: boolean;
}

interface BatchStatusIds {
  open: Set<string>;
  closed: Set<string>;
}

/**
 * Ids of the production batches the caller can list, split into closed and
 * not closed, or null when the batches list cannot be read (foam roles only;
 * owner and admin pass). The list is the current unit's, without deleted
 * batches, so a batch missing from both sets is of unknown status.
 */
const fetchBatchStatusIds = async (): Promise<BatchStatusIds | null> => {
  try {
    const open = new Set<string>();
    const closed = new Set<string>();
    let page = 1;
    let last = 1;
    do {
      const res = await productionApi.getBatches({ page, per_page: 100 });
      res.data.data.forEach((b) => {
        (b.status === "closed" ? closed : open).add(b.id);
      });
      last = res.data.last_page;
      page += 1;
    } while (page <= last && page <= MAX_LOT_PAGES);
    return { open, closed };
  } catch {
    return null;
  }
};

/**
 * The query for the lots of a component an assembly order can draw in the
 * current unit, as AssemblyOrderService::drawableLots sees them: available,
 * holding stock, and not of a foam batch that is not closed. Every page is
 * fetched, so the oldest lots (the ones the automatic draw takes first) are
 * never cut off. A lot is drawable only when its batch is known to be closed;
 * one whose batch status is unknown is kept but marked `unverified`.
 * Keyed under "stockLots" so every stock mutation refreshes it.
 */
export const assemblyComponentLotsQuery = (queryClient: QueryClient, itemId?: string) => ({
  queryKey: ["stockLots", "assemblyComponent", itemId],
  queryFn: async (): Promise<AssemblyComponentLots> => {
    const all: StockLot[] = [];
    let page = 1;
    let last = 1;
    do {
      const res = await inventoryApi.getLots({ inventory_item_id: itemId, status: "available", page, per_page: 100 });
      all.push(...res.data.data);
      last = res.data.last_page;
      page += 1;
    } while (page <= last && page <= MAX_LOT_PAGES);
    const truncated = last > MAX_LOT_PAGES;

    const stocked = all
      .filter((lot) => Number(lot.quantity) > 0)
      // The automatic draw takes the oldest first; list them in that order.
      .sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1));

    const unverified = new Set<string>();
    if (!stocked.some((lot) => lot.production_batch_id)) {
      return { lots: stocked, unverified, excludedOpenBatch: 0, truncated };
    }

    const batches = await queryClient.fetchQuery({
      queryKey: ["productionBatches", "statusIds"],
      queryFn: fetchBatchStatusIds,
      staleTime: 30_000,
    });
    let excludedOpenBatch = 0;
    const lots = stocked.filter((lot) => {
      const batchId = lot.production_batch_id;
      if (!batchId) return true;
      if (batches?.open.has(batchId)) {
        excludedOpenBatch += 1;
        return false;
      }
      if (!batches?.closed.has(batchId)) unverified.add(lot.id);
      return true;
    });
    return { lots, unverified, excludedOpenBatch, truncated };
  },
  enabled: Boolean(itemId),
});

export function useAssemblyComponentLots(itemId?: string) {
  const queryClient = useQueryClient();
  return useQuery(assemblyComponentLotsQuery(queryClient, itemId));
}

/**
 * A refused complete or cancel (a stale record_version, a status that moved
 * on) leaves the cached order out of date: fetch it again so the page shows
 * the current version and status instead of failing the same way on retry.
 */
const refreshOrder = (queryClient: QueryClient, id: string) => {
  queryClient.invalidateQueries({ queryKey: ["assemblyOrder", id] });
  queryClient.invalidateQueries({ queryKey: ["assemblyOrders"] });
};

/** Every mutation answers with the presented order: put it straight into the cache. */
const storeOrder = (queryClient: QueryClient, order: AssemblyOrder) => {
  queryClient.setQueryData(["assemblyOrder", order.id], order);
  queryClient.invalidateQueries({ queryKey: ["assemblyOrders"] });
};

export function useCreateAssemblyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAssemblyOrderPayload) => (await assemblyOrdersApi.create(data)).data,
    onSuccess: (order) => storeOrder(queryClient, order),
  });
}

export function useCompleteAssemblyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recordVersion }: { id: string; recordVersion?: number }) =>
      (await assemblyOrdersApi.complete(id, recordVersion)).data,
    onSuccess: (order) => {
      storeOrder(queryClient, order);
      // Completion consumes component lots, creates the finished lot and posts a journal entry.
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseStockSummary"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseLedger"] });
      queryClient.invalidateQueries({ queryKey: ["movementsForDocument"] });
      queryClient.invalidateQueries({ queryKey: ["stockMovementCard"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["trialBalance"] });
    },
    onError: (_err, { id }) => refreshOrder(queryClient, id),
  });
}

export function useCancelAssemblyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recordVersion }: { id: string; recordVersion?: number }) =>
      (await assemblyOrdersApi.cancel(id, recordVersion)).data,
    onSuccess: (order) => storeOrder(queryClient, order),
    onError: (_err, { id }) => refreshOrder(queryClient, id),
  });
}
