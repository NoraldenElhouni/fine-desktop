import { workOrdersApi } from "../api/endpoints/workOrders";

export const ProductionRepository = {
  createOrder(productSku: string, quantity: number) {
    return workOrdersApi.createOrder(productSku, quantity);
  },

  completeOrder(orderId: string, consumedSku: string, consumedQty: number) {
    return workOrdersApi.completeOrder(orderId, consumedSku, consumedQty);
  },

  getStock(sku: string) {
    return workOrdersApi.getStock(sku);
  },

  getOpenOrders() {
    return workOrdersApi.getOpenOrders();
  },
};
