// src/renderer/repositories/productionRepository.ts
export const ProductionRepository = {
  createOrder: (sku: string, qty: number) =>
    window.electronAPI.production.createOrder(sku, qty),

  completeOrder: (id: string, sku: string, qty: number) =>
    window.electronAPI.production.completeOrder(id, sku, qty),

  getStock: (sku: string) => window.electronAPI.production.getStock(sku),

  getOpenOrders: () => window.electronAPI.production.getOpenOrders(),
};
