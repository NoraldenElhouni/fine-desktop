import apiClient from "../client";
import type { CashAccount } from "../../types/procurement";
import { LEDGER_ERROR_MESSAGE } from "./production";

/*
 * The POS is the one place every sale happens — to a registered client or to
 * another operating unit, of inventory items and of bundles. A bundle sells as
 * one line carrying its name; its pieces are defined after checkout, set aside
 * from stock or cut at the cutter, and handed over later.
 */

export type SaleStatus =
  | "pending_approval"
  | "open"
  | "completed"
  | "rejected"
  // legacy rows from the retired order flow
  | "draft"
  | "confirmed"
  | "fulfilled"
  | "partially_paid"
  | "paid";

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  pending_approval: "بانتظار موافقة الائتمان",
  open: "مفتوح",
  completed: "مكتمل",
  rejected: "مرفوض",
  draft: "مسودة",
  confirmed: "مؤكد",
  fulfilled: "تم التنفيذ",
  partially_paid: "مدفوع جزئياً",
  paid: "مدفوع",
};

export type FulfillmentStatus = "awaiting_definition" | "in_progress" | "ready" | "delivered";

/** Arabic text for sales guard codes whose backend message is English. */
export const SALES_ERROR_MESSAGE: Record<string, string> = {
  ...LEDGER_ERROR_MESSAGE,
  POS_DAY_ALREADY_CLOSED: "تم إقفال يومية الصندوق لهذا اليوم — لا يمكن تسجيل مبيعات أو تحصيلات جديدة حتى الغد.",
  HELD_CART_LIMIT: "وصلت إلى الحد الأقصى للفواتير المعلقة (30).",
  HELD_CART_TOO_LARGE: "الفاتورة أكبر من أن تُعلّق.",
};

export const FULFILLMENT_LABEL: Record<FulfillmentStatus, string> = {
  awaiting_definition: "بانتظار تحديد محتوى الحزمة",
  in_progress: "قيد التجهيز",
  ready: "جاهز للتسليم",
  delivered: "تم التسليم",
};

export type PaymentMethod = "cash" | "bank" | "receivable" | "split";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "نقدي",
  bank: "مصرف",
  receivable: "ذمم (آجل)",
  split: "دفع مجزأ",
};

export type ComponentStatus = "pending" | "at_cutter" | "ready" | "delivered";

export const COMPONENT_STATUS_LABEL: Record<ComponentStatus, string> = {
  pending: "بانتظار التجهيز",
  at_cutter: "في المقص",
  ready: "جاهز",
  delivered: "تم التسليم",
};

type Money = number | string;

export interface SaleComponentAllocation {
  id: string;
  stock_lot_id: string;
  quantity: Money;
  delivered_at?: string | null;
  stock_lot?: { id: string; lot_number: string; status: string } | null;
}

export interface SaleComponent {
  id: string;
  sales_order_line_id: string;
  position: number;
  inventory_item_id: string;
  quantity: Money;
  length_m?: Money | null;
  width_m?: Money | null;
  height_m?: Money | null;
  volume_m3?: Money | null;
  reference_price?: Money | null;
  status: ComponentStatus;
  cutter_work_order_line_id?: string | null;
  unit_cost_actual?: Money;
  notes?: string | null;
  inventory_item?: { id: string; name: string; code: string; item_type?: string } | null;
  allocations?: SaleComponentAllocation[];
}

export interface BundleTemplateItem {
  id: string;
  inventory_item_id: string;
  suggested_quantity?: Money | null;
  length_m?: Money | null;
  width_m?: Money | null;
  height_m?: Money | null;
  inventory_item?: { id: string; name: string; code: string; item_type?: string; selling_price?: Money | null; price_basis?: "unit" | "m3"; volume_m3?: Money | null };
}

export interface SaleLine {
  id: string;
  line_type: "item" | "bundle";
  description?: string | null;
  position: number;
  inventory_item_id?: string | null;
  stock_lot_id?: string | null;
  bundle_id?: string | null;
  quantity: Money;
  length_m?: Money | null;
  width_m?: Money | null;
  height_m?: Money | null;
  unit_price: Money;
  unit_cost_actual: Money;
  inventory_item?: { id: string; name: string; code: string } | null;
  stock_lot?: { id: string; lot_number: string } | null;
  bundle?: { id: string; name: string; items?: BundleTemplateItem[] } | null;
  components?: SaleComponent[];
}

export interface SalePayment {
  id?: string;
  amount: Money;
  method: "cash" | "bank" | "cheque";
  received_at?: string;
  cash_account?: { id: string; name: string } | null;
  received_by?: { id: string; name: string } | null;
  tendered_amount?: Money | null;
  change_given?: Money | null;
  cheque?: { id?: string; number?: string; cheque_no?: string } | null;
}

export interface CreditApproval {
  id: string;
  sales_order_id: string;
  amount_over_limit: Money;
  status: "pending" | "approved" | "rejected";
  decided_by?: { id: string; name: string } | null;
  decided_at?: string | null;
  notes?: string | null;
  created_at: string;
  sales_order?: Sale;
}

export interface Sale {
  id: string;
  order_number: string;
  quotation_id?: string | null;
  buyer_type: "client" | "internal_unit" | "walk_in";
  client_id?: string | null;
  buyer_unit_id?: string | null;
  channel: "pos" | "standard";
  status: SaleStatus;
  fulfillment_status?: FulfillmentStatus | null;
  payment_method?: PaymentMethod | "card" | null;
  cash_account_id?: string | null;
  total_amount: Money;
  total_cost: Money;
  amount_paid: Money;
  notes?: string | null;
  lines?: SaleLine[];
  lines_count?: number;
  client?: {
    id: string;
    credit_limit: Money;
    current_balance: Money;
    entity?: { name?: string; primary_contact?: { phone?: string | null } | null };
  } | null;
  buyer_unit?: { id: string; name: string } | null;
  cash_account?: { id: string; name: string; kind: "cash" | "bank" } | null;
  payments?: SalePayment[];
  sold_by?: { id: string; name: string } | null;
  credit_approval_request?: CreditApproval | null;
  created_at: string;
}

export interface CartLineInput {
  line_type: "item" | "bundle";
  inventory_item_id?: string | null;
  stock_lot_id?: string | null;
  bundle_id?: string | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
}

export interface SplitPaymentChequeInput {
  cheque_no: string;
  bank_name: string;
  drawer_name?: string;
  due_date: string;
  is_certified?: boolean;
}

export interface SplitPaymentPortionInput {
  method: "cash" | "bank" | "cheque";
  amount: number;
  cash_account_id?: string;
  tendered_amount?: number;
  cheque?: SplitPaymentChequeInput;
}

export interface CheckoutInput {
  client_request_id: string;
  client_id?: string | null;
  buyer_unit_id?: string | null;
  payment_method?: PaymentMethod | null;
  cash_account_id?: string | null;
  notes?: string | null;
  lines: CartLineInput[];
  tendered_amount?: number | null;
  payments?: SplitPaymentPortionInput[];
}

export interface InvoiceLine {
  line_type: "item" | "bundle";
  description: string;
  sku?: string | null;
  quantity: number;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  unit_price: number;
  line_total: number;
  lot_number?: string | null;
}

export interface Invoice {
  invoice_number: string;
  sale_number: string;
  date: string;
  seller?: string | null;
  sold_by?: string | null;
  buyer?: string | null;
  buyer_phone?: string | null;
  buyer_type: string;
  payment_method?: PaymentMethod | null;
  cash_account?: string | null;
  lines: InvoiceLine[];
  total_amount: number;
  amount_paid: number;
  outstanding: number;
  status: SaleStatus;
  fulfillment_status?: FulfillmentStatus | null;
}

export interface DeliveryNotePiece {
  id: string;
  item?: string | null;
  sku?: string | null;
  quantity: number;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  status: ComponentStatus;
  notes?: string | null;
}

export interface DeliveryNote {
  document_number: string;
  sale_number: string;
  date: string;
  seller?: string | null;
  buyer?: string | null;
  buyer_phone?: string | null;
  fulfillment_status?: FulfillmentStatus | null;
  lines: {
    line_type: "item" | "bundle";
    description: string;
    sku?: string | null;
    quantity: number;
    length_m?: number | null;
    width_m?: number | null;
    height_m?: number | null;
    lot_number?: string | null;
    pieces: DeliveryNotePiece[];
  }[];
}

export interface MatchingLot {
  id: string;
  lot_number: string;
  quantity: number;
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  grade?: string | null;
  warehouse?: string | null;
  operating_unit?: string | null;
  operating_unit_id?: string | null;
}

export interface OpenCutterOrder {
  id: string;
  order_number: string;
  status: string;
  lines_count: number;
  created_at: string;
}

export interface PosDailyReport {
  date: string;
  timezone: string;
  sales_count: number;
  total: number;
  total_cost: number;
  by_method: Partial<Record<PaymentMethod, { count: number; total: number }>>;
  collected: Partial<Record<"cash" | "bank", { count: number; total: number }>>;
  by_cash_account: { cash_account_id: string | null; name?: string | null; kind?: "cash" | "bank" | null; total: number }[];
  expected_cash: number;
  expected_cash_by_account?: { cash_account_id: string; name: string; expected: number }[];
}

export interface PosDailyClose {
  id: string;
  close_date: string;
  expected_cash: Money;
  counted_cash: Money;
  difference: Money;
  sales_count: number;
  total_sales: Money;
  notes?: string | null;
  closed_by?: { id: string; name: string } | null;
  cash_account_id?: string | null;
  cash_account?: { id: string; name: string } | null;
  journal_entry_id?: string | null;
  journal_entry?: { id: string; reference?: string } | null;
  created_at: string;
}

export type QuotationStatus = "open" | "converted" | "cancelled" | "expired";

export const QUOTATION_STATUS_LABEL: Record<QuotationStatus, string> = {
  open: "ساري",
  converted: "تم البيع",
  cancelled: "ملغى",
  expired: "منتهي الصلاحية",
};

export interface QuotationLine {
  id: string;
  position: number;
  line_type: "item" | "bundle";
  description?: string | null;
  inventory_item_id?: string | null;
  bundle_id?: string | null;
  quantity: Money;
  length_m?: Money | null;
  width_m?: Money | null;
  height_m?: Money | null;
  unit_price: Money;
  inventory_item?: { id: string; name: string; code: string } | null;
  bundle?: { id: string; name: string } | null;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  client_id: string;
  valid_until: string;
  status: Exclude<QuotationStatus, "expired">;
  effective_status: QuotationStatus;
  total_amount: Money;
  converted_sales_order_id?: string | null;
  converted_sale?: { id: string; order_number: string } | null;
  notes?: string | null;
  lines?: QuotationLine[];
  lines_count?: number;
  client?: Sale["client"];
  operating_unit?: { id: string; name: string } | null;
  created_by?: { id: string; name: string } | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SaleFilters {
  status?: string;
  fulfillment_status?: string;
  payment_method?: string;
  client_id?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface CollectPaymentChequeInput {
  cheque_no: string;
  bank_name: string;
  drawer_name?: string;
  due_date: string;
  is_certified?: boolean;
}

export interface CollectPaymentInput {
  amount: number;
  method: "cash" | "bank" | "cheque";
  cash_account_id?: string | null;
  tendered_amount?: number | null;
  cheque?: CollectPaymentChequeInput;
}

export const salesApi = {
  list: (params?: SaleFilters) => apiClient.get<Paginated<Sale>>("/sales", { params }),
  get: (id: string) => apiClient.get<Sale>(`/sales/${id}`),
  checkout: (data: CheckoutInput) => apiClient.post<Sale>("/sales", data),
  collectPayment: (id: string, data: CollectPaymentInput) =>
    apiClient.post<Sale>(`/sales/${id}/payments`, data),
  invoice: (id: string) => apiClient.get<Invoice>(`/sales/${id}/invoice`),
  deliveryNote: (id: string) => apiClient.get<DeliveryNote>(`/sales/${id}/delivery-note`),
  paymentAccounts: (kind?: "cash" | "bank") =>
    apiClient.get<{ data: CashAccount[] }>("/sales/payment-accounts", { params: { kind } }),

  dailyReport: (date?: string) => apiClient.get<PosDailyReport>("/pos/daily-report", { params: { date } }),
  dailyClose: (date?: string) => apiClient.get<{ data: PosDailyClose | null }>("/pos/daily-close", { params: { date } }),
  saveDailyClose: (data: { counted_cash: number; date?: string; notes?: string; cash_account_id?: string | null }) =>
    apiClient.post<PosDailyClose>("/pos/daily-close", data),

  heldCarts: () => apiClient.get<{ data: HeldCart[] }>("/held-carts"),
  holdCart: (data: HoldCartInput) => apiClient.post<{ data: HeldCart }>("/held-carts", data),
  deleteHeldCart: (id: string) => apiClient.delete(`/held-carts/${id}`),
};

export const bundleFulfillmentApi = {
  define: (saleId: string, lineId: string, components: {
    inventory_item_id: string;
    quantity: number;
    length_m?: number | null;
    width_m?: number | null;
    height_m?: number | null;
    notes?: string | null;
  }[]) => apiClient.put<SaleLine>(`/sales/${saleId}/lines/${lineId}/components`, { components }),
  matchingStock: (componentId: string) =>
    apiClient.get<{ component_id: string; needed: number; lots: MatchingLot[] }>(`/sale-components/${componentId}/matching-stock`),
  reserve: (componentId: string, allocations: { stock_lot_id: string; quantity: number }[]) =>
    apiClient.post<SaleComponent>(`/sale-components/${componentId}/reserve`, { allocations }),
  release: (componentId: string) => apiClient.post<SaleComponent>(`/sale-components/${componentId}/release`),
  sendToCutter: (saleId: string, componentIds: string[], cutterWorkOrderId?: string | null) =>
    apiClient.post<{ id: string; order_number: string }>(`/sales/${saleId}/send-to-cutter`, {
      component_ids: componentIds,
      cutter_work_order_id: cutterWorkOrderId ?? null,
    }),
  openCutterOrders: () => apiClient.get<{ data: OpenCutterOrder[] }>("/sales/open-cutter-orders"),
  deliver: (saleId: string, componentIds?: string[]) =>
    apiClient.post<Sale>(`/sales/${saleId}/deliver`, { component_ids: componentIds ?? null }),
};

export const quotationsApi = {
  list: (params?: { status?: string; client_id?: string; search?: string; page?: number; per_page?: number }) =>
    apiClient.get<Paginated<Quotation>>("/quotations", { params }),
  get: (id: string) => apiClient.get<Quotation>(`/quotations/${id}`),
  create: (data: { client_id: string; valid_until?: string | null; notes?: string | null; lines: CartLineInput[] }) =>
    apiClient.post<Quotation>("/quotations", data),
  cancel: (id: string) => apiClient.post<Quotation>(`/quotations/${id}/cancel`),
  convert: (id: string, data: Omit<CheckoutInput, "client_id" | "buyer_unit_id">) =>
    apiClient.post<Sale>(`/quotations/${id}/convert`, data),
};

export const creditApprovalsApi = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get<Paginated<CreditApproval>>("/credit-approval-requests", { params }),
  approve: (id: string, notes?: string) => apiClient.put<CreditApproval>(`/credit-approval-requests/${id}/approve`, { notes }),
  reject: (id: string, notes?: string) => apiClient.put<CreditApproval>(`/credit-approval-requests/${id}/reject`, { notes }),
};

/** "200×70×10 سم" from metres — the size the counter and the cutter read. */
export function formatSizeCm(l?: Money | null, w?: Money | null, h?: Money | null): string | null {
  if (!l || !w || !h) return null;
  const cm = (m: Money) => {
    const value = Math.round(Number(m) * 1000) / 10;
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  };
  return `${cm(l)}×${cm(w)}×${cm(h)} سم`;
}

export interface RestockRequest {
  id: string;
  request_number: string;
  requesting_unit_id: string;
  source_unit_id: string;
  status: "pending_approval" | "approved" | "rejected" | "fulfilled";
  requesting_unit?: { id: string; name: string };
  source_unit?: { id: string; name: string };
  lines?: { id: string; inventory_item_id: string; quantity: number; inventory_item?: { name: string; code: string } }[];
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

export interface CartLine {
  key: string;
  lineType: "item" | "bundle";
  itemId?: string;
  bundleId?: string;
  name: string;
  code?: string;
  qty: string;
  /** Unit price — editable; starts from the item's own price or the bundle's template. */
  price: string;
  stockLotId?: string | null;
  stockLotLabel?: string | null;
  size?: { length_m: number; width_m: number; height_m: number } | null;
}

export interface HeldCartPayload {
  version: 1;
  cart: CartLine[];
  client_id?: string | null;
  buyer_mode?: "client" | "internal";
  buyer_unit_id?: string | null;
  payment_method?: PaymentMethod | null;
  cash_account_id?: string | null;
  notes?: string | null;
}

export interface HeldCart {
  id: string;
  label?: string | null;
  client: { id: string; name: string } | null;
  total: Money;
  line_count: number;
  payload: HeldCartPayload;
  user: { id: string; name: string };
  created_at: string;
}

export interface HoldCartInput {
  label?: string | null;
  client_id?: string | null;
  payload: HeldCartPayload;
  total: number;
  line_count: number;
}

export const heldCartsApi = {
  list: () => apiClient.get<{ data: HeldCart[] }>("/held-carts"),
  create: (data: HoldCartInput) => apiClient.post<{ data: HeldCart }>("/held-carts", data),
  delete: (id: string) => apiClient.delete(`/held-carts/${id}`),
};

