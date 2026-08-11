import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productionApi,
  BlockGroupInput,
  CreateBatchInput,
  ProductionBatch,
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

/** The next operation number the operator is expected to enter. */
export function expectedOperationNumber(batches?: ProductionBatch[]): number {
  if (!batches || batches.length === 0) return 1;
  return Math.max(...batches.map((b) => b.operation_number)) + 1;
}
