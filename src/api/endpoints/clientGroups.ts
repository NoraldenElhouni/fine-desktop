import apiClient from "../client";
import { apiErrorMessage, apiErrorPayload } from "./production";

/** W5-06: a client's price tier default; the POS still lets the cashier switch it. */
export type ClientPriceTier = "retail" | "wholesale";

export const PRICE_TIER_LABEL: Record<ClientPriceTier, string> = {
  retail: "تجزئة",
  wholesale: "جملة",
};

/** ClientGroupResource: a company-wide group whose defaults new clients take. */
export interface ClientGroup {
  id: string;
  code: string;
  name: string;
  default_credit_limit: number;
  default_payment_terms_days: number;
  default_price_tier: ClientPriceTier;
  record_version: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClientGroupPayload {
  code: string;
  name: string;
  default_credit_limit: number;
  default_payment_terms_days: number;
  default_price_tier: ClientPriceTier;
}

/** The group summary a ClientResource carries. */
export interface ClientGroupRef {
  id: string;
  code: string;
  name: string;
  default_price_tier: ClientPriceTier;
}

/**
 * ClientGroupController::WRITE_ROLES. A write also needs one of these held
 * company-wide (or the owner role); a unit-scoped assignment gets CLIENT_GROUP_FORBIDDEN.
 */
export const CLIENT_GROUP_WRITE_ROLES = ["owner", "store-manager", "accounting-manager", "unit_manager", "manager"];

export const getClientGroups = async (): Promise<ClientGroup[]> => {
  const response = await apiClient.get<{ data: ClientGroup[] }>("/client-groups");
  return response.data.data;
};

export const createClientGroup = async (payload: ClientGroupPayload): Promise<ClientGroup> => {
  const response = await apiClient.post<{ data: ClientGroup }>("/client-groups", payload);
  return response.data.data;
};

export const updateClientGroup = async (
  id: string,
  payload: Partial<ClientGroupPayload> & { record_version: number },
): Promise<ClientGroup> => {
  const response = await apiClient.put<{ data: ClientGroup }>(`/client-groups/${id}`, payload);
  return response.data.data;
};

export const deleteClientGroup = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/client-groups/${id}`);
  return response.data;
};

/** Arabic text for the client-group refusal codes (the backend messages are English). */
export const CLIENT_GROUP_ERROR_MESSAGE: Record<string, string> = {
  CLIENT_GROUP_FORBIDDEN: "مجموعات العملاء تسري على كل الوحدات؛ تعديلها يتطلب دوراً إدارياً على مستوى الشركة.",
  CLIENT_GROUP_IN_USE: "لا يمكن حذف مجموعة عليها عملاء — انقلهم إلى مجموعة أخرى أولاً.",
  OPTIMISTIC_LOCK_CONFLICT: "عدّل مستخدم آخر هذه المجموعة للتو — أغلق النافذة وأعد فتحها ثم حاول مرة أخرى.",
};

/** Arabic labels for the group form's validation fields. */
const FIELD_MESSAGE: Record<string, string> = {
  code: "رمز المجموعة مطلوب وفريد (حتى 30 حرفاً).",
  name: "اسم المجموعة مطلوب (حتى 100 حرف).",
  default_credit_limit: "الحد الائتماني الافتراضي رقم لا يقل عن صفر.",
  default_payment_terms_days: "فترة السداد الافتراضية عدد أيام بين 0 و3650.",
  default_price_tier: "التسعير الافتراضي تجزئة أو جملة.",
};

/** Another user deleted the group: PUT/DELETE findOrFail answers a plain 404 with no code. */
export const CLIENT_GROUP_GONE_MESSAGE = "هذه المجموعة لم تعد موجودة — حُدّثت القائمة.";

/** True when the group the request named no longer exists. */
export const isClientGroupGone = (err: unknown): boolean =>
  (err as { response?: { status?: number } } | undefined)?.response?.status === 404;

/** A client-group refusal in Arabic: a known code, else the first invalid field, else the server message. */
export const clientGroupErrorMessage = (err: unknown, fallback: string): string => {
  if (isClientGroupGone(err)) return CLIENT_GROUP_GONE_MESSAGE;
  const payload = apiErrorPayload(err);
  const code = payload?.code;
  if (code && CLIENT_GROUP_ERROR_MESSAGE[code]) {
    const message = CLIENT_GROUP_ERROR_MESSAGE[code];
    if (code === "CLIENT_GROUP_IN_USE" && payload?.clients_count != null) {
      return `${message} عدد العملاء فيها: ${payload.clients_count}.`;
    }
    return message;
  }
  const fields = payload?.errors ? Object.keys(payload.errors) : [];
  const known = fields.find((f) => FIELD_MESSAGE[f]);
  if (known) return FIELD_MESSAGE[known];
  return apiErrorMessage(err, fallback);
};
