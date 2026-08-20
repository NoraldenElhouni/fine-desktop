import apiClient from "../client";
import {
  Supplier,
  CreateSupplierPayload,
  ImportOrder,
  CreateImportOrderPayload,
  TransitionImportOrderPayload,
  PaymentRequest,
  ExecutePaymentPayload,
  BankHold,
  LandedCostLine,
  CreateLandedCostLinePayload,
  FxRate,
  CreateFxRatePayload,
  CashAccount,
  CreateCashAccountPayload,
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
export const getImportOrders = async (params?: {
  operating_unit_id?: string;
  status?: string;
}): Promise<ImportOrder[]> => {
  const response = await apiClient.get<{ data: ImportOrder[] }>("/import-orders", { params });
  return response.data.data;
};

export const getImportOrder = async (id: string): Promise<ImportOrder> => {
  const response = await apiClient.get<{ data: ImportOrder }>(`/import-orders/${id}`);
  return response.data.data;
};

export const createImportOrder = async (payload: CreateImportOrderPayload): Promise<ImportOrder> => {
  const response = await apiClient.post<{ data: ImportOrder }>("/import-orders", payload);
  return response.data.data;
};

export const transitionImportOrder = async (
  id: string,
  payload: TransitionImportOrderPayload
): Promise<{ message: string; data: ImportOrder }> => {
  const response = await apiClient.post<{ message: string; data: ImportOrder }>(
    `/import-orders/${id}/transition`,
    payload
  );
  return response.data;
};

// Payment Requests & Bank Holds API
export const getPaymentRequests = async (params?: {
  operating_unit_id?: string;
  status?: string;
}): Promise<PaymentRequest[]> => {
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
    `/import-orders/${orderId}/landed-cost-lines`
  );
  return response.data.data;
};

export const createLandedCostLine = async (
  orderId: string,
  payload: CreateLandedCostLinePayload
): Promise<LandedCostLine> => {
  const response = await apiClient.post<{ data: LandedCostLine }>(
    `/import-orders/${orderId}/landed-cost-lines`,
    payload
  );
  return response.data.data;
};

export const confirmLandedCostLine = async (
  orderId: string,
  lineId: string
): Promise<{ message: string; data: LandedCostLine }> => {
  const response = await apiClient.post<{ message: string; data: LandedCostLine }>(
    `/import-orders/${orderId}/landed-cost-lines/${lineId}/confirm`
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
  account_code: "2100" | "2210" | "2300";
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
