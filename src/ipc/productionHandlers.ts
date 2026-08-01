import { ipcMain } from "electron";
import { ProductionRepository } from "../repositories/productionRepository";

export function registerProductionHandlers() {
  ipcMain.handle("production:createOrder", (_e, sku: string, qty: number) =>
    ProductionRepository.createOrder(sku, qty),
  );

  ipcMain.handle(
    "production:completeOrder",
    (_e, orderId: string, consumedSku: string, consumedQty: number) =>
      ProductionRepository.completeOrder(orderId, consumedSku, consumedQty),
  );

  ipcMain.handle("production:getStock", (_e, sku: string) =>
    ProductionRepository.getStock(sku),
  );

  ipcMain.handle("production:getOpenOrders", () =>
    ProductionRepository.getOpenOrders(),
  );
}
