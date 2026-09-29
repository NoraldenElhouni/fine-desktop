import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  salesApi,
  restockApi,
  bundleFulfillmentApi,
  quotationsApi,
  creditApprovalsApi,
  SaleFilters,
} from "../api/endpoints/sales";

/**
 * Every sale-changing action refreshes the sale, the lists, and the stock it
 * moved — plus any extra query keys the action touches.
 */
function useSaleMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>, extraKeys: string[][] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      extraKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
      qc.invalidateQueries({ queryKey: ["sale"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["posDailyReport"] });
      qc.invalidateQueries({ queryKey: ["creditApprovals"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
      qc.invalidateQueries({ queryKey: ["availableFoamBlocks"] });
      qc.invalidateQueries({ queryKey: ["inventoryValuation"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useSales(filters: SaleFilters) {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: async () => (await salesApi.list(filters)).data,
    placeholderData: keepPreviousData,
  });
}

export function useSale(id?: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: async () => (await salesApi.get(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCheckout() {
  return useSaleMutation((input: Parameters<typeof salesApi.checkout>[0]) =>
    salesApi.checkout(input).then((r) => r.data));
}

export function useCollectPayment() {
  return useSaleMutation(({ id, ...data }: { id: string; amount: number; method: "cash" | "bank"; cash_account_id: string }) =>
    salesApi.collectPayment(id, data).then((r) => r.data));
}

export function useInvoice(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => (await salesApi.invoice(id as string)).data,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useDeliveryNote(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["deliveryNote", id],
    queryFn: async () => (await salesApi.deliveryNote(id as string)).data,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

/** Company-wide treasuries and banks the POS can receive money into. */
export function usePaymentAccounts() {
  return useQuery({
    queryKey: ["paymentAccounts"],
    queryFn: async () => (await salesApi.paymentAccounts()).data.data,
  });
}

export function usePosDailyReport(date?: string) {
  return useQuery({
    queryKey: ["posDailyReport", date],
    queryFn: async () => (await salesApi.dailyReport(date)).data,
  });
}

export function usePosDailyClose(date?: string, enabled = true) {
  return useQuery({
    queryKey: ["posDailyClose", date],
    queryFn: async () => (await salesApi.dailyClose(date)).data.data,
    enabled,
  });
}

export function useSavePosDailyClose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.saveDailyClose,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posDailyClose"] }),
  });
}

// ── Bundle fulfilment ────────────────────────────────────────────────────────

export function useDefineBundle() {
  return useSaleMutation(({ saleId, lineId, components }: {
    saleId: string;
    lineId: string;
    components: Parameters<typeof bundleFulfillmentApi.define>[2];
  }) => bundleFulfillmentApi.define(saleId, lineId, components).then((r) => r.data));
}

export function useMatchingStock(componentId?: string) {
  return useQuery({
    queryKey: ["matchingStock", componentId],
    queryFn: async () => (await bundleFulfillmentApi.matchingStock(componentId as string)).data,
    enabled: Boolean(componentId),
  });
}

export function useReserveComponent() {
  return useSaleMutation(({ componentId, allocations }: { componentId: string; allocations: { stock_lot_id: string; quantity: number }[] }) =>
    bundleFulfillmentApi.reserve(componentId, allocations).then((r) => r.data));
}

export function useReleaseComponent() {
  return useSaleMutation((componentId: string) => bundleFulfillmentApi.release(componentId).then((r) => r.data));
}

export function useSendToCutter() {
  return useSaleMutation(
    ({ saleId, componentIds, cutterWorkOrderId }: { saleId: string; componentIds: string[]; cutterWorkOrderId?: string | null }) =>
      bundleFulfillmentApi.sendToCutter(saleId, componentIds, cutterWorkOrderId).then((r) => r.data),
    [["openCutterOrders"], ["cutterOrders"]],
  );
}

export function useOpenCutterOrders(enabled = true) {
  return useQuery({
    queryKey: ["openCutterOrders"],
    queryFn: async () => (await bundleFulfillmentApi.openCutterOrders()).data.data,
    enabled,
  });
}

export function useDeliverBundle() {
  return useSaleMutation(({ saleId, componentIds }: { saleId: string; componentIds?: string[] }) =>
    bundleFulfillmentApi.deliver(saleId, componentIds).then((r) => r.data));
}

// ── Quotations ───────────────────────────────────────────────────────────────

export function useQuotations(params: { status?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["quotations", params],
    queryFn: async () => (await quotationsApi.list({ ...params, per_page: 20 })).data,
    placeholderData: keepPreviousData,
  });
}

export function useQuotation(id?: string | null) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => (await quotationsApi.get(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof quotationsApi.create>[0]) => quotationsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useCancelQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsApi.cancel(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotation"] });
    },
  });
}

export function useConvertQuotation() {
  return useSaleMutation(
    ({ id, ...data }: { id: string } & Parameters<typeof quotationsApi.convert>[1]) =>
      quotationsApi.convert(id, data).then((r) => r.data),
    [["quotations"], ["quotation"]],
  );
}

// ── Credit approvals ─────────────────────────────────────────────────────────

export function useCreditApprovals(status = "pending", enabled = true) {
  return useQuery({
    queryKey: ["creditApprovals", status],
    queryFn: async () => (await creditApprovalsApi.list({ status })).data,
    enabled,
  });
}

export function useDecideCredit() {
  return useSaleMutation(({ id, approve, notes }: { id: string; approve: boolean; notes?: string }) =>
    (approve ? creditApprovalsApi.approve(id, notes) : creditApprovalsApi.reject(id, notes)).then((r) => r.data));
}

// ── Internal restock ─────────────────────────────────────────────────────────

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
