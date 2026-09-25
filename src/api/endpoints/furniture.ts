import apiClient from "../client";

export interface Product {
  id: string;
  inventory_item_id: string;
  name: string;
  sku: string;
  description?: string;
  markup_factor: number;
  inventory_item?: { id: string; name: string; sku: string };
  record_version: number;
}

export const furnitureApi = {
  getProducts: (params?: { search?: string; page?: number }) =>
    apiClient.get<{ data: Product[]; total: number }>("/products", { params }),

  createProduct: (data: {
    inventory_item_id: string;
    name: string;
    sku: string;
    description?: string;
    markup_factor?: number;
  }) => apiClient.post<Product>("/products", data),
};
