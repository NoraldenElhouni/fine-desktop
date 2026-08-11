import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productionApi,
  BlockGroupInput,
  ConsumptionLineInput,
  CreateBatchInput,
  ProductionBatch,
  ProductionBatchStatus,
} from "../api/endpoints/production";

export function useProductionBatches(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ["productionBatches", params],
    queryFn: async () => {
      const res = await productionApi.getBatches(params);
      return res.data;
    },
  });
}

export function useProductionBatch(id?: string) {
  return useQuery({
    queryKey: ["productionBatch", id],
    queryFn: async () => {
      const res = await productionApi.getBatch(id as string);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useBatchBlocks(batchId?: string) {
  return useQuery({
    queryKey: ["batchBlocks", batchId],
    queryFn: async () => {
      const res = await productionApi.getBatchBlocks(batchId as string);
      return res.data.data;
    },
    enabled: Boolean(batchId),
  });
}

export function useCreateProductionBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBatchInput) => productionApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionBatches"] });
    },
  });
}

export function useUpdateProductionBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateBatchInput> & { record_version: number };
    }) => productionApi.updateBatch(id, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productionBatches"] });
      queryClient.invalidateQueries({ queryKey: ["productionBatch", variables.id] });
    },
  });
}

export function useDeleteProductionBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productionApi.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionBatches"] });
    },
  });
}

export function useRegisterBlocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, groups }: { id: string; groups: BlockGroupInput[] }) =>
      productionApi.registerBlocks(id, groups),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batchBlocks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["productionBatch", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["productionBatches"] });
      // Blocks are stock — the ledger and valuation both move.
      queryClient.invalidateQueries({ queryKey: ["stockLots"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

export function useTransitionBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductionBatchStatus }) =>
      productionApi.transition(id, status),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productionBatch", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["productionBatches"] });
      // Closing a batch apportions cost onto its blocks.
      queryClient.invalidateQueries({ queryKey: ["batchBlocks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

export function useConsumptionReport(batchId?: string) {
  return useQuery({
    queryKey: ["consumptionReport", batchId],
    queryFn: async () => {
      try {
        const res = await productionApi.getConsumptionReport(batchId as string);
        return res.data;
      } catch (err) {
        // A run that has not reported yet is a normal state, not an error.
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(batchId),
    retry: false,
  });
}

export function useRecordConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lines }: { id: string; lines: ConsumptionLineInput[] }) =>
      productionApi.recordConsumption(id, lines),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consumptionReport", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["productionBatch", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tankStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

/** The next operation number the operator is expected to enter. */
export function expectedOperationNumber(batches?: ProductionBatch[]): number {
  if (!batches || batches.length === 0) return 1;
  return Math.max(...batches.map((b) => b.operation_number)) + 1;
}
