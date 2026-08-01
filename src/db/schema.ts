// src/main/db/schema.ts
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const workOrders = sqliteTable("work_orders", {
  id: text("id").primaryKey(),
  productSku: text("product_sku").notNull(),
  quantity: real("quantity").notNull(),
  status: text("status").notNull(), // 'open' | 'completed'
  createdAt: text("created_at").notNull(),
  syncVersion: integer("sync_version"),
});

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull(),
  quantityDelta: real("quantity_delta").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"),
  createdAt: text("created_at").notNull(),
  syncVersion: integer("sync_version"),
});

export const outbox = sqliteTable("outbox", {
  id: text("id").primaryKey(),
  tableName: text("table_name").notNull(),
  operation: text("operation").notNull(), // 'create' | 'update'
  payload: text("payload").notNull(), // JSON string
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const syncState = sqliteTable("sync_state", {
  id: integer("id").primaryKey(),
  lastPulledVersion: text("last_pulled_version"), // Nullable text (ISO 8601 string)
});
