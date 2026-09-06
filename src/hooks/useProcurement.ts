import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  createSupplier,
  getImportOrders,
  getImportOrder,
  createImportOrder,
  transitionImportOrder,
  getPaymentRequests,
  executePaymentRequest,
  getBankHolds,
  getLandedCostLines,
  createLandedCostLine,
  approveLandedCostLine,
  markLandedCostLinePaid,
} from "../api/endpoints/procurement";
import {
  CreateSupplierPayload,
  CreateImportOrderPayload,
  TransitionImportOrderPayload,
  ExecutePaymentPayload,
  CreateLandedCostLinePayload,
  GetPaymentRequestsParams,
} from "../types/procurement";

export function useSuppliers(operatingUnitId?: string) {
  return useQuery({
    queryKey: ["suppliers", operatingUnitId],
    queryFn: () => getSuppliers(operatingUnitId),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

export function useImportOrders(params?: {
  operating_unit_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["importOrders", params],
    queryFn: () => getImportOrders(params),
  });
}

export function useImportOrder(id?: string) {
  return useQuery({
    queryKey: ["importOrder", id],
    queryFn: () => getImportOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateImportOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateImportOrderPayload) => createImportOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["importOrders"] });
    },
  });
}

export function useTransitionImportOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TransitionImportOrderPayload;
    }) => transitionImportOrder(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["importOrders"] });
      qc.invalidateQueries({ queryKey: ["importOrder"] });
      qc.invalidateQueries({ queryKey: ["inventoryValuation"] });
      qc.invalidateQueries({ queryKey: ["stockLots"] });
    },
  });
}

export function usePaymentRequests(params?: GetPaymentRequestsParams) {
  return useQuery({
    queryKey: ["paymentRequests", params],
    queryFn: () => getPaymentRequests(params),
  });
}

export function useExecutePaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ExecutePaymentPayload;
    }) => executePaymentRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentRequests"] });
      qc.invalidateQueries({ queryKey: ["importOrders"] });
      qc.invalidateQueries({ queryKey: ["cashAccounts"] });
    },
  });
}

export function useBankHolds() {
  return useQuery({
    queryKey: ["bankHolds"],
    queryFn: () => getBankHolds(),
  });
}

export function useLandedCostLines(orderId?: string) {
  return useQuery({
    queryKey: ["landedCostLines", orderId],
    queryFn: () => getLandedCostLines(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useCreateLandedCostLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: CreateLandedCostLinePayload;
    }) => createLandedCostLine(orderId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["landedCostLines", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["importOrder", vars.orderId] });
    },
  });
}

export function useApproveLandedCostLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      lineId,
      note,
    }: {
      orderId: string;
      lineId: string;
      note?: string;
    }) => approveLandedCostLine(orderId, lineId, note),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["landedCostLines", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["importOrder", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["myAllocationApprovals"] });
    },
  });
}

export function useMarkLandedCostLinePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      lineId,
      note,
    }: {
      orderId: string;
      lineId: string;
      note?: string;
    }) => markLandedCostLinePaid(orderId, lineId, note),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["landedCostLines", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["importOrder", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["myAllocationApprovals"] });
    },
  });
}
