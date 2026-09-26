import apiClient from "../client";

export type InventoryItemType =
  | "raw_material"
  | "foam_block"
  | "cut_template_piece"
  | "slice"
  | "byproduct_fill"
  | "furniture_finished_good"
  | "packaging"
  | "barrel"
  | "pallet";

export const ITEM_TYPE_LABELS: Record<InventoryItemType, string> = {
  raw_material: "مادة خام",
  foam_block: "قالب إسفنج",
  cut_template_piece: "قطعة قالب تشذيب",
  slice: "شريحة",
  byproduct_fill: "حشو ثانوي",
  furniture_finished_good: "منتج أثاث تام",
  packaging: "تغليف",
  barrel: "برميل",
  pallet: "منصة نقالة",
};

export interface ItemCategory {
  id: string;
  operating_unit_id?: string;
  parent_id?: string | null;
  name: string;
  /** This category's own segment of the hierarchical code, e.g. '01'. */
  code_segment?: string;
  /** Full hierarchical code, e.g. '0101'. */
  code: string;
  item_type?: InventoryItemType;
  /** Digit width reserved for each direct child's code_segment. */
  child_code_length?: number;
  description?: string;
  created_at: string;
  /** Present when the API includes it (e.g. on the root-level listing). */
  children_count?: number;
}

export interface GetCategoriesParams {
  search?: string;
  /** Only categories with no parent (top-level). */
  root_only?: boolean;
  /** Only the direct children of this category id. */
  parent_id?: string;
}

export const categoriesApi = {
  getCategories: (params?: GetCategoriesParams) =>
    apiClient.get<ItemCategory[]>("/item-categories", { params }),

  getCategory: (id: string) =>
    apiClient.get<ItemCategory>(`/item-categories/${id}`),

  createCategory: (data: Partial<ItemCategory>) =>
    apiClient.post<ItemCategory>("/item-categories", data),

  updateCategory: (id: string, data: Partial<ItemCategory>) =>
    apiClient.put<ItemCategory>(`/item-categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete(`/item-categories/${id}`),
};
