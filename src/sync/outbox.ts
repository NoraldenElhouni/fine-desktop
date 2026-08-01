// src/main/sync/outbox.ts
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { outbox } from "../db/schema";

export function enqueue(
  tableName: string,
  operation: "create" | "update",
  payload: unknown,
) {
  db.insert(outbox)
    .values({
      id: randomUUID(),
      tableName,
      operation,
      payload: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    })
    .run();
}

export function getPending() {
  return db.select().from(outbox).where(eq(outbox.status, "pending")).all();
}

export function markSynced(ids: string[]) {
  if (ids.length === 0) return;
  db.update(outbox)
    .set({ status: "synced" })
    .where(inArray(outbox.id, ids))
    .run();
}
