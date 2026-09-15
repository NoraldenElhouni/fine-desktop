import apiClient from "../client";

export type SalesOrderStatus =
  | "draft"
  | "pending_approval"
  | "confirmed"
  | "fulfilled"
  | "partially_paid"
  | "paid"
  | "rejected"
  | "completed";

export const SALES_STATUS_LABEL: Record<SalesOrderStatus, string> = {
  draft: "مسودة",
  pending_approval: "بانتظار اعتماد الائتمان",
  confirmed: "مؤكد",
  fulfilled: "تم التنفيذ",
  partially_paid: "مدفوع جزئياً",
  paid: "مدفوع",
  rejected: "مرفوض",
  completed: "مكتمل",
};

/** Filter chips for the pipeline — every state an order can sit in. */
export const SALES_STATUS_ORDER: SalesOrderStatus[] = [
  "draft", "pending_approval", "confirmed", "fulfilled", "partially_paid", "paid", "rejected", "completed",
];

export interface StockLotRef {
  id: string;
  lot_number: string;
  volume_m3: number;
  length_m: number;
  width_m: number;
  height_m: number;
  unit_cost: number;
  grade: string;
}

export interface SalesOrderLine {
  id: string;
  inventory_item_id: string;
  stock_lot_id?: string | null;
  quantity: number;
  unit_price: number;
  unit_cost_actual: number;
  inventory_item?: { id: string; name: string; sku: string };
  stock_lot?: StockLotRef | null;
}

export interface CreditApproval {
  id: string;
  amount_over_limit: number;
  status: "pending" | "approved" | "rejected";
  decided_by?: { name: string };
  notes?: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  buyer_type: "client" | "internal_unit" | "walk_in";
  client_id?: string;
  buyer_unit_id?: string;
  channel: "standard" | "pos";
  status: SalesOrderStatus;
  total_amount: number;
  total_cost: number;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
  lines?: SalesOrderLine[];
  lines_count?: number;
  client?: { id: string; credit_limit: number; current_balance: number; entity?: { name?: string } };
  buyer_unit?: { id: string; name: string };
  credit_approval_request?: CreditApproval | null;
  record_version: number;
  created_at: string;
}

export interface Invoice {
  invoice_number: string;
  date: string;
  seller?: string;
  buyer: string;
  lines: { item?: string; sku?: string; quantity: number; unit_price: number; line_total: number; lot_number?: string | null }[];
  total_amount: number;
  amount_paid: number;
  outstanding: number;
  status: string;
}

export interface PosDailyReport {
  date: string;
  sales_count: number;
  total: number;
  total_cost: number;
  by_method: Record<string, { count: number; total: number }>;
}

export interface PosDailyClose {
  id: string;
  close_date: string;
  expected_cash: string;
  counted_cash: string;
  difference: string;
  sales_count: number;
  total_sales: string;
  notes?: string | null;
  closed_by?: { id: string; name: string } | null;
  created_at: string;
}

export const salesApi = {
  getOrders: (params?: { status?: string; channel?: string; buyer_type?: string; page?: number }) =>
    apiClient.get<{ data: SalesOrder[]; total: number }>("/sales-orders", { params }),

  getOrder: (id: string) => apiClient.get<SalesOrder>(`/sales-orders/${id}`),

  createOrder: (data: {
    order_number: string;
    buyer_type: "client" | "internal_unit";
    client_id?: string;
    buyer_unit_id?: string;
    notes?: string;
    lines: { inventory_item_id: string; stock_lot_id?: string | null; quantity: number; unit_price: number }[];
  }) => apiClient.post<SalesOrder>("/sales-orders", data),

  /** Draft in, confirmed or pending_approval out — the credit check decides. */
  submit: (id: string) => apiClient.post<SalesOrder>(`/sales-orders/${id}/submit`),

  fulfill: (id: string) => apiClient.post<SalesOrder>(`/sales-orders/${id}/fulfill`),

  recordPayment: (id: string, data: { amount: number; payment_method?: "cash" | "card" }) =>
    apiClient.post<SalesOrder>(`/sales-orders/${id}/record-payment`, data),

  complete: (id: string) => apiClient.post<SalesOrder>(`/sales-orders/${id}/complete`),

  invoice: (id: string) => apiClient.get<Invoice>(`/sales-orders/${id}/invoice`),

  approveCredit: (approvalId: string, notes?: string) =>
    apiClient.put<CreditApproval>(`/credit-approval-requests/${approvalId}/approve`, { notes }),

  rejectCredit: (approvalId: string, notes?: string) =>
    apiClient.put<CreditApproval>(`/credit-approval-requests/${approvalId}/reject`, { notes }),

  posCheckout: (data: {
    order_number: string;
    payment_method: "cash" | "card";
    client_id?: string;
    items: { inventory_item_id: string; stock_lot_id?: string | null; quantity: number; unit_price: number }[];
  }) => apiClient.post<SalesOrder>("/pos/sales", data),

  posDailyReport: (date?: string) =>
    apiClient.get<PosDailyReport>("/pos/daily-report", { params: { date } }),

  posDailyClose: (date?: string) =>
    apiClient.get<{ data: PosDailyClose | null }>("/pos/daily-close", { params: { date } }),

  savePosDailyClose: (data: { counted_cash: number; date?: string; notes?: string }) =>
    apiClient.post<PosDailyClose>("/pos/daily-close", data),
};

export interface RestockRequest {
  id: string;
  request_number: string;
  requesting_unit_id: string;
  source_unit_id: string;
  status: "pending_approval" | "approved" | "rejected" | "fulfilled";
  requesting_unit?: { id: string; name: string };
  source_unit?: { id: string; name: string };
  lines?: { id: string; inventory_item_id: string; quantity: number; inventory_item?: { name: string; sku: string } }[];
  created_at: string;
}

export const restockApi = {
  list: (params?: { status?: string }) =>
    apiClient.get<{ data: RestockRequest[] }>("/internal-restock-requests", { params }),

  create: (data: {
    request_number: string;
    source_unit_id: string;
    notes?: string;
    lines: { inventory_item_id: string; quantity: number }[];
  }) => apiClient.post<RestockRequest>("/internal-restock-requests", data),

  approve: (id: string) => apiClient.put<RestockRequest>(`/internal-restock-requests/${id}/approve`),
  reject: (id: string) => apiClient.put<RestockRequest>(`/internal-restock-requests/${id}/reject`),
  fulfill: (id: string) => apiClient.post<RestockRequest>(`/internal-restock-requests/${id}/fulfill`),
};
