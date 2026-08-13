import apiClient from "../client";
import type { Paginated } from "./accounting";

export type OverheadCategory = "water" | "electricity" | "rent" | "maintenance" | "other";
export type AllocationMethod = "even_split" | "usage_based" | "headcount_based" | "manual_percentage";

export const OVERHEAD_CATEGORY_LABEL: Record<OverheadCategory, string> = {
  water: "مياه",
  electricity: "كهرباء",
  rent: "إيجار",
  maintenance: "صيانة",
  other: "أخرى",
};

export const ALLOCATION_METHOD_LABEL: Record<AllocationMethod, string> = {
  even_split: "توزيع متساوٍ",
  usage_based: "حسب الاستهلاك",
  headcount_based: "حسب عدد العاملين",
  manual_percentage: "نسب يدوية",
};

export interface OverheadAllocation {
  id: string;
  operating_unit_id: string;
  method: AllocationMethod;
  amount: string;
  absorbed: boolean;
  operating_unit?: { id: string; name: string };
}

export interface OverheadExpense {
  id: string;
  operating_unit_id: string | null;
  category: OverheadCategory;
  description: string | null;
  amount: string;
  currency: string;
  expense_date: string;
  payment_source: "cash" | "payable";
  status: "recorded" | "allocated";
  allocated_at: string | null;
  operating_unit?: { id: string; name: string } | null;
  allocations?: OverheadAllocation[];
}

export interface OverheadAllocationRule {
  id: string;
  method: AllocationMethod;
  percentages: Record<string, number> | null;
  is_active: boolean;
}

export interface CreateOverheadPayload {
  category: OverheadCategory;
  description?: string;
  amount: number;
  expense_date: string;
  payment_source: "cash" | "payable";
  is_company_wide?: boolean;
  operating_unit_id?: string | null;
}

export interface AllocatePayload {
  method?: AllocationMethod;
  usage?: Record<string, number>;
  percentages?: Record<string, number>;
}

export const overheadApi = {
  getExpenses: (params?: { status?: string; category?: string; page?: number; company_wide?: boolean }) =>
    apiClient.get<Paginated<OverheadExpense>>("/overhead-expenses", { params }),

  createExpense: (payload: CreateOverheadPayload) =>
    apiClient.post<OverheadExpense>("/overhead-expenses", payload),

  allocate: (id: string, payload: AllocatePayload) =>
    apiClient.post<OverheadExpense>(`/overhead-expenses/${id}/allocate`, payload),

  getRules: () => apiClient.get<{ data: OverheadAllocationRule[] }>("/overhead-allocation-rules"),

  storeRule: (payload: { method: AllocationMethod; percentages?: Record<string, number> }) =>
    apiClient.post<OverheadAllocationRule>("/overhead-allocation-rules", payload),
};
