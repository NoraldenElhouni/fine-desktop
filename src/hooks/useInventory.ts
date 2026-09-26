import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, InventoryItem } from "../api/endpoints/inventory";

export function useInventoryItems(params?: { category_id?: string; item_type?: string; search?: string; page?: number }) {
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
    mutationFn: (data: Partial<InventoryItem>) => inventoryApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItem", id] });
    },
  });
}

export function useStockLots(params?: { category_id?: string; status?: string; grade?: string; warehouse_id?: string; inventory_item_id?: string; page?: number; attrs?: Record<string, any> }) {
  return useQuery({
    queryKey: ["stockLots", params],
    queryFn: async () => {
      const res = await inventoryApi.getLots(params);
      return res.data;
    },
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
    },
  });
}
