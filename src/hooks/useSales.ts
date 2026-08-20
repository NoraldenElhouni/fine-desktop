import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi, restockApi } from "../api/endpoints/sales";

export function useSalesOrders(params?: { status?: string; channel?: string; buyer_type?: string }) {
  return useQuery({
    queryKey: ["salesOrders", params],
    queryFn: async () => (await salesApi.getOrders(params)).data,
  });
}

export function useSalesOrder(id?: string) {
  return useQuery({
    queryKey: ["salesOrder", id],
    queryFn: async () => (await salesApi.getOrder(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salesOrders"] }),
  });
}

/** Every order action invalidates the order, the list, and whatever stock moved. */
function useOrderAction<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["salesOrder"] });
      qc.invalidateQueries({ queryKey: ["salesOrders"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
      qc.invalidateQueries({ queryKey: ["inventoryValuation"] });
    },
  });
}

export function useSubmitOrder() {
  return useOrderAction((id: string) => salesApi.submit(id));
}

export function useFulfillOrder() {
  return useOrderAction((id: string) => salesApi.fulfill(id));
}

export function useRecordPayment() {
  return useOrderAction(
    ({ id, amount, method }: { id: string; amount: number; method?: "cash" | "card" }) =>
      salesApi.recordPayment(id, { amount, payment_method: method }),
  );
}

export function useCompleteOrder() {
  return useOrderAction((id: string) => salesApi.complete(id));
}

export function useDecideCredit() {
  return useOrderAction(
    ({ approvalId, approve, notes }: { approvalId: string; approve: boolean; notes?: string }) =>
      approve ? salesApi.approveCredit(approvalId, notes) : salesApi.rejectCredit(approvalId, notes),
  );
}

export function useInvoice(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => (await salesApi.invoice(id as string)).data,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function usePosCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.posCheckout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posDailyReport"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
      qc.invalidateQueries({ queryKey: ["salesOrders"] });
    },
  });
}

export function usePosDailyReport(date?: string) {
  return useQuery({
    queryKey: ["posDailyReport", date],
    queryFn: async () => (await salesApi.posDailyReport(date)).data,
  });
}

export function usePosDailyClose(date?: string, enabled = true) {
  return useQuery({
    queryKey: ["posDailyClose", date],
    queryFn: async () => (await salesApi.posDailyClose(date)).data.data,
    enabled,
  });
}

export function useSavePosDailyClose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.savePosDailyClose,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posDailyClose"] }),
  });
}

export function useRestockRequests(status?: string) {
  return useQuery({
    queryKey: ["restockRequests", status],
    queryFn: async () => (await restockApi.list({ status: status || undefined })).data,
  });
}

export function useCreateRestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restockApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restockRequests"] }),
  });
}

export function useRestockAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" | "fulfill" }) =>
      action === "approve" ? restockApi.approve(id)
        : action === "reject" ? restockApi.reject(id)
          : restockApi.fulfill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restockRequests"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
    },
  });
}
