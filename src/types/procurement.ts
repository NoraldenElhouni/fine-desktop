export type ImportOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'awaiting_bank_approval'
  | 'awaiting_transfer'
  | 'paid'
  | 'in_transit'
  | 'at_port'
  | 'awaiting_receipt'
  | 'received'
  | 'complete';

export type PaymentRoute = 'bank' | 'market';
export type PaymentRequestStatus = 'pending' | 'paid' | 'rejected';
export type LandedCostType =
  | 'supplier_price'
  | 'fx_spread'
  | 'customs'
  | 'freight'
  | 'local_transport'
  | 'other';

export interface Supplier {
  id: string;
  operating_unit_id: string;
  name: string;
  contact?: string | null;
  default_currency: string;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankHold {
  id: string;
  payment_request_id: string;
  held_amount_lyd: number;
  exact_amount_used: number;
  released_amount: number;
  bank_reference?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRequest {
  id: string;
  operating_unit_id: string;
  import_order_id: string;
  route: PaymentRoute;
  invoice_ref?: string | null;
  amount_requested: number;
  status: PaymentRequestStatus;
  fx_rate_used?: number | null;
  bank_hold?: BankHold | null;
  created_at?: string;
  updated_at?: string;
}

export interface LandedCostLine {
  id: string;
  import_order_id: string;
  type: LandedCostType;
  amount: number;
  currency: string;
  is_confirmed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GoodsReceipt {
  id: string;
  import_order_id: string;
  warehouse_id: string;
  received_qty: number;
  condition_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ImportOrder {
  id: string;
  operating_unit_id: string;
  supplier_id: string;
  supplier?: Supplier;
  currency: string;
  negotiated_price: number;
  quantity: number;
  status: ImportOrderStatus;
  record_version: number;
  payment_requests?: PaymentRequest[];
  landed_cost_lines?: LandedCostLine[];
  goods_receipt?: GoodsReceipt | null;
  created_at?: string;
  updated_at?: string;
}

export interface FxRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  captured_at: string;
  created_at?: string;
}

export interface CashAccount {
  id: string;
  operating_unit_id: string;
  name: string;
  currency: string;
  balance: number;
  created_at?: string;
}

export interface CreateSupplierPayload {
  operating_unit_id: string;
  name: string;
  contact?: string;
  default_currency?: string;
  address?: string;
}

export interface CreateImportOrderPayload {
  operating_unit_id: string;
  supplier_id: string;
  currency?: string;
  negotiated_price: number;
  quantity: number;
}

export interface TransitionImportOrderPayload {
  action:
    | 'pending_payment'
    | 'select_route'
    | 'shipment'
    | 'arrive_port'
    | 'transport_warehouse'
    | 'receive_goods'
    | 'complete';
  route?: PaymentRoute;
  amount_requested?: number;
  held_amount_lyd?: number;
  invoice_ref?: string;
  warehouse_id?: string;
  received_qty?: number;
  condition_notes?: string;
}

export interface ExecutePaymentPayload {
  fx_rate_used: number;
  exact_amount_used_lyd?: number;
  bank_reference?: string;
}

export interface CreateLandedCostLinePayload {
  type: LandedCostType;
  amount: number;
  currency?: string;
  is_confirmed?: boolean;
}

export interface CreateFxRatePayload {
  from_currency: string;
  to_currency: string;
  rate: number;
  captured_at?: string;
}

export interface CreateCashAccountPayload {
  operating_unit_id: string;
  name: string;
  currency?: string;
  balance?: number;
}
