import type { CoaAction, NewCoaAccountPayload } from './entities';

export type ImportOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'awaiting_bank_approval'
  | 'awaiting_transfer'
  | 'paid'
  | 'in_transit'
  | 'at_port'
  | 'in_transit_to_warehouse'
  | 'at_warehouse'
  | 'awaiting_receipt'
  | 'received'
  | 'complete';

export type PaymentRoute = 'bank' | 'market';
export type PaymentRequestStatus = 'pending' | 'paid' | 'rejected';
export type LandedCostStatus = 'pending' | 'approved' | 'paid';
export type LandedCostType =
  | 'supplier_price'
  | 'fx_spread'
  | 'customs'
  | 'freight'
  | 'local_transport'
  | 'other';

export const LANDED_COST_STATUS_LABEL: Record<LandedCostStatus, string> = {
  pending: 'بانتظار الموافقة',
  approved: 'معتمد بانتظار التأكيد',
  paid: 'مدفوع ومؤكد',
};

export interface Supplier {
  id: string;
  operating_unit_id: string;
  operating_unit?: { id: string; name: string };
  account_id?: string | null;
  account?: { id: string; account_code: string; name: string } | null;
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
  extra_allocation_note?: string | null;
  booked_fx_rate?: number | null;
  effective_settled_lyd?: number | null;
  effective_rate?: number | null;
  variance_vs_booked_lyd?: number | null;
  variance_within_tolerance?: boolean;
  variance_exceeds_hard_cap?: boolean;
  fx_tolerance_lyd?: number;
  fx_hard_cap_percent?: number;
  bank_hold?: BankHold | null;
  import_order?: {
    id: string;
    order_number: string;
    status?: string;
    supplier_id?: string;
    supplier?: {
      id: string;
      name: string;
      code?: string | null;
      contact_person?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface LandedCostParty {
  id: string;
  name: string;
}

export interface LandedCostLine {
  id: string;
  import_order_id: string;
  type: LandedCostType;
  amount: number;
  currency: string;
  is_confirmed: boolean;
  status: LandedCostStatus;
  note?: string | null;
  approved_by_user_id: string | null;
  approved_at: string | null;
  paid_by_user_id: string | null;
  paid_at: string | null;
  confirmation_note: string | null;
  approver?: LandedCostParty | null;
  payer?: LandedCostParty | null;
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

export interface ImportOrderItemInventoryItem {
  id: string;
  name: string;
  sku: string;
  item_type: string;
  unit_of_measure: string;
}

export interface ImportOrderItem {
  id: string;
  import_order_id: string;
  inventory_item_id: string;
  inventory_item?: ImportOrderItemInventoryItem;
  quantity: number;
  unit_price: number;
  currency: string;
  line_total: number;
  record_version: number;
}

export interface ImportOrderItemInput {
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
}

export interface ImportOrderItemsPayload {
  data: ImportOrderItem[];
  items_total: number;
}

export interface ImportOrder {
  id: string;
  operating_unit_id: string;
  supplier_id: string;
  supplier?: Supplier;
  currency: string;
  negotiated_price: number;
  quantity: number;
  total_amount?: number;
  booked_fx_rate?: number | null;
  status: ImportOrderStatus;
  record_version: number;
  arrived_warehouse_id?: string | null;
  arrived_warehouse?: { id: string; name: string };
  items?: ImportOrderItemsPayload;
  payment_requests?: PaymentRequest[];
  landed_cost_lines?: LandedCostLine[];
  goods_receipt?: GoodsReceipt | null;
  created_at?: string;
  updated_at?: string;
}

export function getImportOrderTotal(order: ImportOrder): number {
  if (order.total_amount !== undefined && order.total_amount !== null) {
    return Number(order.total_amount);
  }
  if (order.items?.items_total !== undefined && order.items.items_total !== null && order.items.items_total > 0) {
    return Number(order.items.items_total);
  }
  if (Array.isArray(order.items?.data) && order.items.data.length > 0) {
    return order.items.data.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  }
  return Number(order.negotiated_price || 0) * Number(order.quantity || 0);
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
  account_id?: string | null;
  coa_action?: CoaAction;
  new_account?: NewCoaAccountPayload | null;
}

export interface CreateImportOrderPayload {
  operating_unit_id: string;
  supplier_id: string;
  currency?: string;
  negotiated_price?: number;
  quantity?: number;
  items?: ImportOrderItemInput[];
}

export interface UpdateImportOrderPayload {
  supplier_id?: string;
  items: ImportOrderItemInput[];
}

export interface TransitionImportOrderPayload {
  action:
    | 'pending_payment'
    | 'select_route'
    | 'shipment'
    | 'arrive_port'
    | 'arrived_at_warehouse'
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
  fx_rate_used?: number | null;
  exact_amount_used_lyd?: number | null;
  bank_reference?: string;
  extra_allocation_note?: string;
}

export interface CreateLandedCostLinePayload {
  type: LandedCostType;
  amount: number;
  currency?: string;
  note?: string;
}

export interface GetPaymentRequestsParams {
  status?: PaymentRequestStatus;
  route?: PaymentRoute;
  from?: string;
  to?: string;
  operating_unit_id?: string;
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
