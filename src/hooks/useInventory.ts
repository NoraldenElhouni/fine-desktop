import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, InventoryItem, StockLot } from "../api/endpoints/inventory";

export function useInventoryItems(params?: { category_id?: string; item_type?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["inventoryItems", params],
    queryFn: async () => {
      const res = await inventoryApi.getItems(params);
      return res.data;
    },
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
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["trialBalance"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
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

export function useTankStocks(operatingUnitId?: string) {
  return useQuery({
    queryKey: ["tankStocks", operatingUnitId],
    queryFn: async () => {
      const res = await inventoryApi.getTanks(operatingUnitId);
      return res.data;
    },
  });
}

export function useRefillTank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      chemical_inventory_item_id: string;
      /** @deprecated Ignored by the server — the unit comes from the X-Operating-Unit-ID header. */
      operating_unit_id?: string;
      refill_quantity: number;
      refill_unit_cost: number;
    }) => inventoryApi.refillTank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tankStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

/**
 * Pour a source lot into the tank. Unlike the adjustment path this moves real
 * stock, so the source lot and any recovered empties change too.
 */
export function useRefillFromLot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      source_stock_lot_id: string;
      draw_quantity?: number;
      draw_containers?: number;
    }) => inventoryApi.refillFromLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tankStocks"] });
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

export function useStockAdjustments(params?: { status?: string; operating_unit_id?: string }) {
  return useQuery({
    queryKey: ["stockAdjustments", params],
    queryFn: async () => {
      const res = await inventoryApi.getAdjustments(params);
      return res.data.data;
    },
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.approveAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockAdjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
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
