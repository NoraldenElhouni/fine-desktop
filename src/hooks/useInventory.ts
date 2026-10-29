import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, type InventoryItemPayload, type InventoryLookupResult } from "../api/endpoints/inventory";

export function useInventoryItems(params?: { category_id?: string; item_type?: string; search?: string; page?: number; per_page?: number; with_stock?: 1 }) {
  return useQuery({
    queryKey: ["inventoryItems", params],
    queryFn: async () => {
      const res = await inventoryApi.getItems(params);
      return res.data;
    },
  });
}

export function useInventoryItem(id?: string) {
  return useQuery({
    queryKey: ["inventoryItem", id],
    queryFn: async () => {
      const res = await inventoryApi.getItem(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryItemPayload) => inventoryApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryItemPayload }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItem", id] });
    },
  });
}

/**
 * W4-03: resolves a scanned or typed code (barcode, item code, lot number).
 * A mutation because a scan is a one-off action; it changes nothing, so it
 * invalidates nothing. A miss rejects with 404 CODE_NOT_FOUND (isCodeNotFound).
 */
export function useInventoryLookup() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await inventoryApi.lookup(code);
      return res.data;
    },
  });
}

/**
 * W4-03 scan boxes that take scans back to back (POS, count entry): every
 * code is queued the moment Enter is pressed and looked up in turn, so a
 * second scan arriving while the first is still on the network is neither
 * dropped nor glued onto the first one's text. The handlers are read at call
 * time, so they always see the latest render's state; `queued` is how many
 * codes still wait behind the one being handled.
 */
export function useScanQueue(handlers: {
  onResult: (code: string, res: InventoryLookupResult, queued: number) => void;
  onError: (code: string, err: unknown, queued: number) => void;
  onIdle?: () => void;
}) {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });
  const queueRef = useRef<string[]>([]);
  const busyRef = useRef(false);
  const [pending, setPending] = useState(0);

  const drain = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      let code = queueRef.current.shift();
      while (code !== undefined) {
        try {
          const res = await inventoryApi.lookup(code);
          handlersRef.current.onResult(code, res.data, queueRef.current.length);
        } catch (err) {
          handlersRef.current.onError(code, err, queueRef.current.length);
        }
        setPending((n) => Math.max(0, n - 1));
        code = queueRef.current.shift();
      }
    } finally {
      busyRef.current = false;
      handlersRef.current.onIdle?.();
    }
  }, []);

  const enqueue = useCallback(
    (code: string) => {
      queueRef.current.push(code);
      setPending((n) => n + 1);
      void drain();
    },
    [drain],
  );

  return { enqueue, pending: pending > 0 };
}

export function useStockLots(params?: { category_id?: string; status?: string; grade?: string; warehouse_id?: string; inventory_item_id?: string; bin_location?: string; page?: number; attrs?: Record<string, any> }) {
  return useQuery({
    queryKey: ["stockLots", params],
    queryFn: async () => {
      const res = await inventoryApi.getLots(params);
      return res.data;
    },
  });
}

/**
 * One lot, live. Its key sits under "stockLots", so every mutation that
 * invalidates the lot lists (shelf edit, cut, intake) refreshes it too.
 */
export function useStockLot(id: string | null | undefined) {
  return useQuery({
    queryKey: ["stockLots", "one", id],
    queryFn: async () => {
      const res = await inventoryApi.getLot(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useStockIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryApi.intakeLot>[0]) => inventoryApi.intakeLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseStockSummary"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseLedger"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["trialBalance"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateStockLot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof inventoryApi.updateLot>[1];
    }) => inventoryApi.updateLot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["batchBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availableFoamBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availableForCutting"] });
    },
  });
}

export function useAvailableForCutting(params?: { min_volume_m3?: number; grade?: string }) {
  return useQuery({
    queryKey: ["availableForCutting", params],
    queryFn: async () => {
      const res = await inventoryApi.getAvailableForCutting(params);
      return res.data.data;
    },
  });
}

export function useAvailableFoamBlocks(params: {
  inventory_item_id: string;
  grade?: string;
  min_volume_m3?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["availableFoamBlocks", params],
    queryFn: async () => {
      const res = await inventoryApi.getAvailableFoamBlocks(params);
      return res.data;
    },
    enabled: Boolean(params.inventory_item_id),
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ["inventoryValuation"],
    queryFn: async () => {
      const res = await inventoryApi.getValuation();
      return res.data;
    },
  });
}

export function useWarehouseStockSummary(warehouseId?: string) {
  return useQuery({
    queryKey: ["warehouseStockSummary", warehouseId],
    queryFn: async () => {
      const res = await inventoryApi.getWarehouseStockSummary(warehouseId as string);
      return res.data;
    },
    enabled: Boolean(warehouseId),
  });
}

export function useWarehouseLedger(warehouseId?: string, params?: { sku?: string; per_page?: number; page?: number }) {
  return useQuery({
    queryKey: ["warehouseLedger", warehouseId, params],
    queryFn: async () => {
      const res = await inventoryApi.getWarehouseLedger(warehouseId as string, params);
      return res.data;
    },
    enabled: Boolean(warehouseId),
  });
}

export function useMovementsForDocument(type: string, id?: string) {
  return useQuery({
    queryKey: ["movementsForDocument", type, id],
    queryFn: async () => {
      const res = await inventoryApi.getMovementsForDocument(type, id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useProcessCutRemnant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        remnant_action: "restock_remnant" | "convert_to_byproduct";
        remnant_dimensions?: { length_m: number; width_m: number; height_m: number };
        byproduct_weight_kg?: number;
      };
    }) => inventoryApi.processCutRemnant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["availableForCutting"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseStockSummary"] });
      queryClient.invalidateQueries({ queryKey: ["warehouseLedger"] });
    },
  });
}
