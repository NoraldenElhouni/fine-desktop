import apiClient from "../client";

export interface WorkOrder {
  id: string;
  productSku: string;
  quantity: number;
  status: "open" | "completed";
  createdAt: string;
}

export const workOrdersApi = {
  getOpenOrders: async (): Promise<WorkOrder[]> => {
    const response = await apiClient.get<{ data: WorkOrder[] } | WorkOrder[]>("/work-orders", {
      params: { status: "open" },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data ?? [];
  },

  createOrder: async (productSku: string, quantity: number): Promise<WorkOrder> => {
    const response = await apiClient.post<WorkOrder>("/work-orders", {
      productSku,
      quantity,
    });
    return response.data;
  },

  completeOrder: async (
    orderId: string,
    consumedSku: string,
    consumedQty: number,
  ): Promise<WorkOrder> => {
    const response = await apiClient.post<WorkOrder>(`/work-orders/${orderId}/complete`, {
      consumedSku,
      consumedQty,
    });
    return response.data;
  },

  getStock: async (sku: string): Promise<number> => {
    const response = await apiClient.get<{ stock: number }>(`/inventory/stock/${sku}`);
    return response.data.stock ?? 0;
  },
};
