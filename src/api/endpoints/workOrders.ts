import apiClient from "../client";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { useAuthStore } from "../../stores/authStore";

export interface WorkOrder {
  id: string;
  productSku: string;
  quantity: number;
  status: "open" | "completed" | "pending";
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
    const user = useAuthStore.getState().user as any;
    const operatingUnitId =
      useServerConfigStore.getState().operatingUnitId ||
      user?.operating_unit_id ||
      user?.operating_units?.[0]?.id ||
      user?.unit_id;

    const payload: Record<string, any> = {
      product_sku: productSku,
      productSku,
      quantity,
      status: "open",
    };

    if (operatingUnitId) {
      payload.operating_unit_id = operatingUnitId;
    }

    const response = await apiClient.post<WorkOrder>("/work-orders", payload);
    return response.data;
  },

  completeOrder: async (
    orderId: string,
    consumedSku: string,
    consumedQty: number,
  ): Promise<WorkOrder> => {
    const response = await apiClient.post<WorkOrder>(`/work-orders/${orderId}/complete`, {
      consumedSku,
      consumed_sku: consumedSku,
      consumedQty,
      consumed_qty: consumedQty,
    });
    return response.data;
  },

  getStock: async (sku: string): Promise<number> => {
    const response = await apiClient.get<{ stock: number }>(`/inventory/stock/${sku}`);
    return response.data.stock ?? 0;
  },
};
