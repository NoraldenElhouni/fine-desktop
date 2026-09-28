import apiClient from "../client";
import { Account } from "./accounting";

/**
 * Mirror of backend `App\Enums\InventoryEventType`. Keep these strings in sync
 * — they are sent verbatim in `event_type` POST bodies.
 */
export const INVENTORY_EVENT_TYPES = [
  "opening",
  "ending",
  "purchases",
  "sales",
  "purchase_returns",
  "sales_returns",
  "cogs",
  "waste",
  "earned_discount",
  "granted_discount",
  "transport_in",
  "sales_commission",
] as const;

export type InventoryEventType = (typeof INVENTORY_EVENT_TYPES)[number];

export const INVENTORY_EVENT_LABELS: Record<InventoryEventType, string> = {
  opening: "بضاعة أول المدة",
  ending: "بضاعة آخر المدة",
  purchases: "حساب المشتريات",
  sales: "حساب المبيعات",
  purchase_returns: "حساب مردود المشتريات",
  sales_returns: "حساب مردودة مبيعات",
  cogs: "تكلفة البضاعة المباعة",
  waste: "حساب إهلاك / هالك",
  earned_discount: "حساب خصم مكتسب",
  granted_discount: "حساب خصم ممنوح",
  transport_in: "حساب غبور المشتريات",
  sales_commission: "حساب عمولة المبيعات",
};

/**
 * Events whose absence blocks a real posting (intake / sale / etc.). The
 * backend hard-fails with 422 `INVENTORY_ACCOUNT_NOT_LINKED` when one of
 * these is missing; the others are surfaced as warnings until the matching
 * service comes online.
 */
export const REQUIRED_INVENTORY_EVENTS: InventoryEventType[] = [
  "purchases",
  "sales",
  "cogs",
];

export interface InventoryItemAccount {
  id: string;
  event_type: InventoryEventType;
  event_label: string;
  account: Pick<Account, "id" | "account_code" | "name" | "type" | "currency"> | null;
}

export interface InventoryItemAccountsResponse {
  data: InventoryItemAccount[];
  meta: {
    linked_count: number;
    total_events: number;
  };
}

export interface UpsertInventoryItemAccountPayload {
  event_type: InventoryEventType;
  account_id: string;
}

export const inventoryItemAccountsApi = {
  list: (itemId: string) =>
    apiClient.get<InventoryItemAccountsResponse>(`/inventory-items/${itemId}/accounts`),

  upsert: (itemId: string, payload: UpsertInventoryItemAccountPayload) =>
    apiClient.post<{ data: InventoryItemAccount; message: string }>(
      `/inventory-items/${itemId}/accounts`,
      payload,
    ),

  remove: (itemId: string, rowId: string) =>
    apiClient.delete<{ message: string }>(`/inventory-items/${itemId}/accounts/${rowId}`),
};
