import apiClient from "../client";

export interface InventoryAttributeDefinition {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  data_type: "number" | "text" | "select" | "boolean";
  unit_of_measure?: string;
  options?: string[];
  is_required_on_lot: boolean;
  is_filterable: boolean;
  sort_order: number;
}

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
  attribute_definitions?: InventoryAttributeDefinition[];
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

  // Global Master Attributes Library
  getAllAttributes: () =>
    apiClient.get<InventoryAttributeDefinition[]>("/attribute-definitions"),

  createGlobalAttribute: (data: Partial<InventoryAttributeDefinition>) =>
    apiClient.post<InventoryAttributeDefinition>("/attribute-definitions", data),

  // Category Attribute Definitions
  getAttributeDefinitions: (categoryId: string) =>
    apiClient.get<InventoryAttributeDefinition[]>(`/item-categories/${categoryId}/attribute-definitions`),

  createAttributeDefinition: (categoryId: string, data: Partial<InventoryAttributeDefinition>) =>
    apiClient.post<InventoryAttributeDefinition>(`/item-categories/${categoryId}/attribute-definitions`, data),

  updateAttributeDefinition: (id: string, data: Partial<InventoryAttributeDefinition>) =>
    apiClient.put<InventoryAttributeDefinition>(`/attribute-definitions/${id}`, data),

  deleteAttributeDefinition: (id: string) =>
    apiClient.delete(`/attribute-definitions/${id}`),
};
