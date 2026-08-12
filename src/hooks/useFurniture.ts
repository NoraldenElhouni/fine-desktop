import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { furnitureApi, ProductionOrderStatus } from "../api/endpoints/furniture";

export function useProducts(search?: string) {
  return useQuery({
    queryKey: ["furnitureProducts", search],
    queryFn: async () => (await furnitureApi.getProducts({ search: search || undefined })).data,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: furnitureApi.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["furnitureProducts"] }),
  });
}

export function useProductBoms(productId?: string) {
  return useQuery({
    queryKey: ["productBoms", productId],
    queryFn: async () => (await furnitureApi.getProductBoms(productId as string)).data,
    enabled: Boolean(productId),
  });
}

export function usePricePreview(bomId?: string) {
  return useQuery({
    queryKey: ["bomPricePreview", bomId],
    queryFn: async () => (await furnitureApi.pricePreview(bomId as string)).data,
    enabled: Boolean(bomId),
  });
}

/** Every BOM mutation invalidates the product's BOM list and the price preview. */
function useBomMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productBoms"] });
      qc.invalidateQueries({ queryKey: ["bomPricePreview"] });
      qc.invalidateQueries({ queryKey: ["furnitureProducts"] });
    },
  });
}

export function useCreateBom() {
  return useBomMutation(furnitureApi.createBom);
}

export function useActivateBom() {
  return useBomMutation((id: string) => furnitureApi.activateBom(id));
}

export function useCloneBom() {
  return useBomMutation((id: string) => furnitureApi.cloneBom(id));
}

export function useAddComponentLine() {
  return useBomMutation(
    ({ bomId, data }: { bomId: string; data: Parameters<typeof furnitureApi.addComponentLine>[1] }) =>
      furnitureApi.addComponentLine(bomId, data),
  );
}

export function useRemoveComponentLine() {
  return useBomMutation(({ bomId, lineId }: { bomId: string; lineId: string }) =>
    furnitureApi.removeComponentLine(bomId, lineId),
  );
}

export function useAddLaborRequirement() {
  return useBomMutation(
    ({ bomId, data }: { bomId: string; data: Parameters<typeof furnitureApi.addLaborRequirement>[1] }) =>
      furnitureApi.addLaborRequirement(bomId, data),
  );
}

export function useRemoveLaborRequirement() {
  return useBomMutation(({ bomId, reqId }: { bomId: string; reqId: string }) =>
    furnitureApi.removeLaborRequirement(bomId, reqId),
  );
}

export function useProductionOrders(params?: { status?: string; stock_only?: boolean }) {
  return useQuery({
    queryKey: ["furnitureOrders", params],
    queryFn: async () => (await furnitureApi.getOrders(params)).data,
  });
}

export function useProductionOrder(id?: string) {
  return useQuery({
    queryKey: ["furnitureOrder", id],
    queryFn: async () => (await furnitureApi.getOrder(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCreateProductionOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: furnitureApi.createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["furnitureOrders"] }),
  });
}

export function useTransitionProductionOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductionOrderStatus }) =>
      furnitureApi.transition(id, status),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["furnitureOrder", v.id] });
      qc.invalidateQueries({ queryKey: ["furnitureOrders"] });
      // Reservation, consumption and finished goods all move stock.
      qc.invalidateQueries({ queryKey: ["stockLots"] });
      qc.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

export function useLogLabor(orderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employee_id: string;
      role: string;
      hours_logged: number;
      hourly_rate?: number;
    }) => furnitureApi.logLabor(orderId as string, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["furnitureOrder", orderId] }),
  });
}
