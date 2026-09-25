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
  name: string;
  code: string;
  item_type?: InventoryItemType;
  description?: string;
  created_at: string;
}

export const categoriesApi = {
  getCategories: (params?: { search?: string }) =>
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
