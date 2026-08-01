import { randomUUID } from "node:crypto";
import { db } from "../db/client";
import { workOrders, inventoryMovements } from "../db/schema";
import { eq } from "drizzle-orm";
import { enqueue } from "../sync/outbox";

export const ProductionRepository = {
  createOrder(productSku: string, quantity: number) {
    const order = {
      id: randomUUID(),
      productSku,
      quantity,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    db.insert(workOrders).values(order).run();
    enqueue("work_orders", "create", order);
    return order;
  },

  completeOrder(orderId: string, consumedSku: string, consumedQty: number) {
    db.update(workOrders)
      .set({ status: "completed" })
      .where(eq(workOrders.id, orderId))
      .run();
    const order = db
      .select()
      .from(workOrders)
      .where(eq(workOrders.id, orderId))
      .get();
    enqueue("work_orders", "update", { id: orderId, status: "completed" });

    const produced = {
      id: randomUUID(),
      sku: order!.productSku,
      quantityDelta: order!.quantity,
      reason: "production",
      referenceId: orderId,
      createdAt: new Date().toISOString(),
    };
    const consumed = {
      id: randomUUID(),
      sku: consumedSku,
      quantityDelta: -consumedQty,
      reason: "consumed",
      referenceId: orderId,
      createdAt: new Date().toISOString(),
    };
    db.insert(inventoryMovements).values([produced, consumed]).run();
    enqueue("inventory_movements", "create", produced);
    enqueue("inventory_movements", "create", consumed);

    return order;
  },

  getStock(sku: string) {
    const rows = db
      .select()
      .from(inventoryMovements)
      .where(eq(inventoryMovements.sku, sku))
      .all();
    return rows.reduce((sum, r) => sum + r.quantityDelta, 0);
  },
};
