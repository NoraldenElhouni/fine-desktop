import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  salesApi,
  restockApi,
  bundleFulfillmentApi,
  quotationsApi,
  creditApprovalsApi,
  heldCartsApi,
  salesReturnsApi,
  posShiftsApi,
  CreateSalesReturnInput,
  HoldCartInput,
  PosShift,
  PosShiftFilters,
  Sale,
  SaleFilters,
  SalesReturnFilters,
} from "../api/endpoints/sales";
import { installmentsApi, InstallmentPlanInput } from "../api/endpoints/installments";
import { apiErrorPayload } from "../api/endpoints/production";
import { useOperatingUnits } from "./useOperatingUnits";
import { useServerConfigStore } from "../stores/serverConfigStore";
import { useAuthStore } from "../stores/authStore";

/**
 * Every sale-changing action refreshes the sale, the lists, and the stock it
 * moved — plus any extra query keys the action touches.
 */
function useSaleMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  extraKeys: string[][] = [],
  options: { gcTime?: number } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: fn,
    onSuccess: (data) => {
      extraKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
      qc.invalidateQueries({ queryKey: ["sale"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["posDailyReport"] });
      // Cash taken or refunded moves the open shift's live totals (close dialog, X-report).
      qc.invalidateQueries({ queryKey: ["posShift"] });
      qc.invalidateQueries({ queryKey: ["posShiftXReport"] });
      qc.invalidateQueries({ queryKey: ["creditApprovals"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
      qc.invalidateQueries({ queryKey: ["availableFoamBlocks"] });
      qc.invalidateQueries({ queryKey: ["inventoryValuation"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      // W5-08: collections, returns and new plans move the derived installment statuses.
      qc.invalidateQueries({ queryKey: ["installments"] });

      const sale = data as unknown as Partial<Sale> | undefined;
      if (sale?.payments?.some((p) => p.method === "cheque" || Boolean(p.cheque))) {
        qc.invalidateQueries({ queryKey: ["cheques"] });
        qc.invalidateQueries({ queryKey: ["chequeSummary"] });
      }
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
  const qc = useQueryClient();
  return useSaleMutation(async (input: Parameters<typeof salesApi.checkout>[0]) => {
    const res = await salesApi.checkout(input);
    const sale = res.data;
    if (input.payments?.some((p) => p.method === "cheque")) {
      qc.invalidateQueries({ queryKey: ["cheques"] });
      qc.invalidateQueries({ queryKey: ["chequeSummary"] });
    }
    return sale;
  }, [], { gcTime: 0 }); // variables may carry a manager price-override password — never keep them cached
}

export function useCollectPayment() {
  return useSaleMutation(
    ({ id, ...data }: { id: string } & Parameters<typeof salesApi.collectPayment>[1]) =>
      salesApi.collectPayment(id, data).then((r) => r.data),
    [["cheques"], ["chequeSummary"]],
  );
}

/** W5-08: put an existing receivable sale on installments, optionally taking a down payment first. */
export function useAddInstallmentPlan() {
  return useSaleMutation(
    ({ saleId, ...data }: { saleId: string } & InstallmentPlanInput) =>
      installmentsApi.addPlan(saleId, data).then((r) => r.data),
    [["client"], ["clientSummary"]],
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

// ── Cashier shifts (FR-SLREP-008) ────────────────────────────────────────────

/** Opening or closing a shift changes the current shift, its reports, the day's figures and the sales views. */
function invalidateShiftQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["posShifts"] });
  qc.invalidateQueries({ queryKey: ["posShift"] });
  qc.invalidateQueries({ queryKey: ["posShiftXReport"] });
  qc.invalidateQueries({ queryKey: ["posDailyReport"] });
  qc.invalidateQueries({ queryKey: ["posDailyClose"] });
  qc.invalidateQueries({ queryKey: ["sales"] });
  qc.invalidateQueries({ queryKey: ["sale"] });
}

export function usePosShifts(filters: PosShiftFilters, enabled = true) {
  return useQuery({
    queryKey: ["posShifts", "list", filters],
    queryFn: async () => (await posShiftsApi.list(filters)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The drawer's open shift in this unit, or null. */
export function useCurrentPosShift(cashAccountId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["posShifts", "current", cashAccountId],
    queryFn: async () => (await posShiftsApi.current(cashAccountId as string)).data.data,
    enabled: Boolean(cashAccountId) && enabled,
  });
}

/** One shift with its totals — live while open, the stored Z-report once closed. */
export function usePosShift(id?: string | null) {
  return useQuery({
    queryKey: ["posShift", id],
    queryFn: async () => (await posShiftsApi.get(id as string)).data,
    enabled: Boolean(id),
  });
}

export function usePosShiftXReport(id?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["posShiftXReport", id],
    queryFn: async () => (await posShiftsApi.xReport(id as string)).data,
    enabled: Boolean(id) && enabled,
  });
}

export function useOpenPosShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cash_account_id: string; opening_float: number }) => (await posShiftsApi.open(data)).data,
    onSuccess: () => invalidateShiftQueries(qc),
  });
}

export function useClosePosShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; counted_cash: number; notes?: string | null }) =>
      (await posShiftsApi.close(id, data)).data,
    onSuccess: (closed) => {
      // The close response is the full Z-report (present()): seed it so the Z-report never shows the
      // cached open shift while the refetch runs.
      qc.setQueryData(["posShift", closed.id], closed);
      invalidateShiftQueries(qc);
      // The count difference posts to the drawer and 625 / 44.
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
      qc.invalidateQueries({ queryKey: ["treasuryOptions"] });
      qc.invalidateQueries({ queryKey: ["paymentAccounts"] });
    },
    onError: (err) => {
      // Closed on another terminal or by a manager: drop the stale open shift.
      if (apiErrorPayload(err)?.code === "SHIFT_ALREADY_CLOSED") invalidateShiftQueries(qc);
    },
  });
}

/** Owner / unit managers switch cashier shifts on or off for a unit. */
export function useUpdatePosShiftSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, enabled }: { unitId: string; enabled: boolean }) =>
      (await posShiftsApi.updateUnitSettings(unitId, { pos_shifts_enabled: enabled })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operatingUnits"] });
      qc.invalidateQueries({ queryKey: ["operatingUnit"] });
      invalidateShiftQueries(qc);
    },
  });
}

/**
 * The POS's shift state: whether the current unit runs shifts, the logged-in
 * user's own open shift (the only one cash is locked to by default), and the
 * unit's other open shifts, which a cashier may join explicitly (shared drawer).
 */
export function useActivePosShift() {
  const unitId = useServerConfigStore((s) => s.operatingUnitId);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: units = [], isLoading: isUnitLoading } = useOperatingUnits();
  const unit = units.find((u) => u.id === unitId) ?? null;
  const enabled = Boolean(unit?.pos_shifts_enabled);
  const { data, isLoading } = usePosShifts({ status: "open", per_page: 50 }, enabled);
  const openShifts = enabled ? (data?.data ?? []) : [];
  const isOwn = (s: PosShift) => userId !== undefined && String(s.cashier_user_id) === String(userId);
  const ownShifts = openShifts.filter(isOwn);
  const ownShift = ownShifts[0] ?? null;
  /** More open shifts of this cashier (another drawer or terminal): kept reachable so they can be closed. */
  const extraOwnShifts = ownShifts.slice(1);
  const otherShifts = openShifts.filter((s) => !isOwn(s));
  return {
    unit,
    enabled,
    ownShift,
    extraOwnShifts,
    otherShifts,
    isLoading: enabled && isLoading,
    isUnitLoading: Boolean(unitId) && isUnitLoading,
  };
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
  const qc = useQueryClient();
  return useSaleMutation(
    async ({ id, ...data }: { id: string } & Parameters<typeof quotationsApi.convert>[1]) => {
      const res = await quotationsApi.convert(id, data);
      const sale = res.data;
      if (data.payments?.some((p) => p.method === "cheque")) {
        qc.invalidateQueries({ queryKey: ["cheques"] });
        qc.invalidateQueries({ queryKey: ["chequeSummary"] });
      }
      return sale;
    },
    [["quotations"], ["quotation"]],
    { gcTime: 0 }, // variables may carry a manager price-override password — never keep them cached
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

// ── Sales returns ────────────────────────────────────────────────────────────

export function useReturnableLines(saleId?: string) {
  return useQuery({
    queryKey: ["returnableLines", saleId],
    queryFn: async () => (await salesReturnsApi.returnable(saleId as string)).data,
    enabled: Boolean(saleId),
  });
}

/** A return moves stock back, pays money out of a treasury or credits the client — refresh all of it. */
export function useCreateSalesReturn() {
  return useSaleMutation(
    ({ saleId, ...data }: { saleId: string } & CreateSalesReturnInput) =>
      salesReturnsApi.create(saleId, data).then((r) => r.data),
    [
      ["salesReturns"],
      ["salesReturn"],
      ["returnableLines"],
      ["treasuryOptions"],
      ["cashAccounts"],
      ["cashAccountStatement"],
      ["paymentAccounts"],
      ["client"],
      ["debtorStatements"],
    ],
  );
}

export function useSalesReturns(filters: SalesReturnFilters) {
  return useQuery({
    queryKey: ["salesReturns", filters],
    queryFn: async () => (await salesReturnsApi.list(filters)).data,
    placeholderData: keepPreviousData,
  });
}

export function useSalesReturn(id?: string | null) {
  return useQuery({
    queryKey: ["salesReturn", id],
    queryFn: async () => (await salesReturnsApi.get(id as string)).data,
    enabled: Boolean(id),
  });
}

// ── Held carts ───────────────────────────────────────────────────────────────

export function useHeldCarts() {
  return useQuery({
    queryKey: ["heldCarts"],
    queryFn: async () => (await heldCartsApi.list()).data.data,
    refetchOnWindowFocus: true,
  });
}

export function useHoldCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: HoldCartInput) => (await heldCartsApi.create(data)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["heldCarts"] });
    },
  });
}

export function useDeleteHeldCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => heldCartsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["heldCarts"] });
    },
  });
}

