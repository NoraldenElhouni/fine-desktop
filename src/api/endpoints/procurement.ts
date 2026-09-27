import apiClient from "../client";
import {
  Supplier,
  CreateSupplierPayload,
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  TransitionPurchaseOrderPayload,
  ReceiveOrderPayload,
  PurchaseOrderKind,
  PaymentRequest,
  ExecutePaymentPayload,
  BankHold,
  LandedCostLine,
  CreateLandedCostLinePayload,
  FxRate,
  CreateFxRatePayload,
  CashAccount,
  CreateCashAccountPayload,
  GetPaymentRequestsParams,
} from "../../types/procurement";

// Suppliers API
export const getSuppliers = async (operating_unit_id?: string): Promise<Supplier[]> => {
  const response = await apiClient.get<{ data: Supplier[] }>("/suppliers", {
    params: { operating_unit_id },
  });
  return response.data.data;
};

export const createSupplier = async (payload: CreateSupplierPayload): Promise<Supplier> => {
  const response = await apiClient.post<{ data: Supplier }>("/suppliers", payload);
  return response.data.data;
};

// Import Orders API
export const getPurchaseOrders = async (params?: {
  operating_unit_id?: string;
  status?: string;
  /** Wave 5: 'foreign' or 'local'. Omit to fetch both. */
  kind?: PurchaseOrderKind;
  /** Cap response size to keep the renderer responsive. Defaults to 100 on the server. */
  per_page?: number;
}): Promise<PurchaseOrder[]> => {
  const response = await apiClient.get<{ data: PurchaseOrder[] }>("/purchase-orders", { params });
  return response.data.data;
};

export const getPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const response = await apiClient.get<{ data: PurchaseOrder }>(`/purchase-orders/${id}`);
  return response.data.data;
};

export const createPurchaseOrder = async (payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> => {
  const response = await apiClient.post<{ data: PurchaseOrder }>("/purchase-orders", payload);
  return response.data.data;
};

export const updatePurchaseOrder = async (
  id: string,
  payload: UpdatePurchaseOrderPayload
): Promise<PurchaseOrder> => {
  const response = await apiClient.put<{ data: PurchaseOrder }>(`/purchase-orders/${id}`, payload);
  return response.data.data;
};

export const transitionPurchaseOrder = async (
  id: string,
  payload: TransitionPurchaseOrderPayload
): Promise<{ message: string; data: PurchaseOrder }> => {
  const response = await apiClient.post<{ message: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/transition`,
    payload
  );
  return response.data;
};

/**
 * Wave 5 (local flow): approve a draft local purchase order.
 * Manager sign-off before goods can be received.
 */
export const approvePurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const response = await apiClient.post<{ message: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/approve`,
  );
  return response.data.data;
};

/**
 * Wave 5 (local flow): atomic per-line batch receive.
 * Updates each PurchaseOrderItem.received_quantity atomically.
 * If all lines are fully received, transitions the order to 'received'.
 */
export const receivePurchaseOrder = async (
  id: string,
  payload: ReceiveOrderPayload,
): Promise<PurchaseOrder> => {
  const response = await apiClient.post<{ message: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/receive`,
    payload,
  );
  return response.data.data;
};

/**
 * Wave 5 (local flow): record payment on a received local PO.
 * Transitions received -> paid -> closed (auto-close on full receipt).
 */
export const payLocalPurchaseOrder = async (
  id: string,
  payload: { payment_source_account_id: string },
): Promise<PurchaseOrder> => {
  const response = await apiClient.post<{ message: string; data: PurchaseOrder }>(
    `/purchase-orders/${id}/pay-local`,
    payload,
  );
  return response.data.data;
};

// Payment Requests & Bank Holds API
export const getPaymentRequests = async (
  params?: GetPaymentRequestsParams
): Promise<PaymentRequest[]> => {
  const response = await apiClient.get<{ data: PaymentRequest[] }>("/payment-requests", { params });
  return response.data.data;
};

export const executePaymentRequest = async (
  id: string,
  payload: ExecutePaymentPayload
): Promise<{ message: string; data: PaymentRequest }> => {
  const response = await apiClient.post<{ message: string; data: PaymentRequest }>(
    `/payment-requests/${id}/execute`,
    payload
  );
  return response.data;
};

export const getBankHolds = async (): Promise<BankHold[]> => {
  const response = await apiClient.get<{ data: BankHold[] }>("/bank-holds");
  return response.data.data;
};

// Landed Costs API
export const getLandedCostLines = async (orderId: string): Promise<LandedCostLine[]> => {
  const response = await apiClient.get<{ data: LandedCostLine[] }>(
    `/purchase-orders/${orderId}/landed-cost-lines`
  );
  return response.data.data;
};

export const createLandedCostLine = async (
  orderId: string,
  payload: CreateLandedCostLinePayload
): Promise<LandedCostLine> => {
  const response = await apiClient.post<{ data: LandedCostLine }>(
    `/purchase-orders/${orderId}/landed-cost-lines`,
    payload
  );
  return response.data.data;
};

export const confirmLandedCostLine = async (
  orderId: string,
  lineId: string
): Promise<{ message: string; data: LandedCostLine }> => {
  const response = await apiClient.post<{ message: string; data: LandedCostLine }>(
    `/purchase-orders/${orderId}/landed-cost-lines/${lineId}/approve`
  );
  return response.data;
};

export const approveLandedCostLine = async (
  orderId: string,
  lineId: string,
  note?: string
): Promise<{ message: string; data: LandedCostLine }> => {
  const response = await apiClient.post<{ message: string; data: LandedCostLine }>(
    `/purchase-orders/${orderId}/landed-cost-lines/${lineId}/approve`,
    { note }
  );
  return response.data;
};

export const markLandedCostLinePaid = async (
  orderId: string,
  lineId: string,
  note?: string
): Promise<{ message: string; data: LandedCostLine }> => {
  const response = await apiClient.post<{ message: string; data: LandedCostLine }>(
    `/purchase-orders/${orderId}/landed-cost-lines/${lineId}/mark-paid`,
    { note }
  );
  return response.data;
};

// Treasury & FX API
export const getFxRates = async (): Promise<FxRate[]> => {
  const response = await apiClient.get<{ data: FxRate[] }>("/fx-rates");
  return response.data.data;
};

export const createFxRate = async (payload: CreateFxRatePayload): Promise<FxRate> => {
  const response = await apiClient.post<{ data: FxRate }>("/fx-rates", payload);
  return response.data.data;
};

// Payable settlements (2100 AP / 2210 payroll deductions / 2300 landed cost clearing)
export interface PayableOutstanding {
  account_code: "21" | "221" | "23";
  outstanding: number;
}

export interface PayableSettlement {
  id: string;
  account_code: string;
  amount: string;
  reference: string | null;
  settled_at: string;
  settled_by?: { id: string; name: string } | null;
  operating_unit?: { id: string; name: string } | null;
}

export const getPayableOutstanding = async (): Promise<PayableOutstanding[]> => {
  const response = await apiClient.get<{ data: PayableOutstanding[] }>("/payable-settlements/outstanding");
  return response.data.data;
};

export const getPayableSettlements = async (): Promise<PayableSettlement[]> => {
  const response = await apiClient.get<{ data: PayableSettlement[] }>("/payable-settlements");
  return response.data.data;
};

export const settlePayable = async (payload: {
  account_code: string;
  amount: number;
  reference?: string;
}): Promise<PayableSettlement> => {
  const response = await apiClient.post<PayableSettlement>("/payable-settlements", payload);
  return response.data;
};

export const getCashAccounts = async (operating_unit_id?: string): Promise<CashAccount[]> => {
  const response = await apiClient.get<{ data: CashAccount[] }>("/cash-accounts", {
    params: { operating_unit_id },
  });
  return response.data.data;
};

export const createCashAccount = async (payload: CreateCashAccountPayload): Promise<CashAccount> => {
  const response = await apiClient.post<{ data: CashAccount }>("/cash-accounts", payload);
  return response.data.data;
};
