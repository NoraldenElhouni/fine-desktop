// src/main/sync/syncService.ts
import { ipcMain } from "electron";
import { eq } from "drizzle-orm";
import axios from "axios";
import { db } from "../db/client";
import { workOrders, inventoryMovements, syncState } from "../db/schema";
import { getPending, markSynced } from "./outbox";

// Vite statically replaces import.meta.env.* at build time for every config
// it builds, main.ts included, so this mirrors src/api/client.ts's lookup.
// Only the origin is used here since /api/sync/* is a separate route group
// from the versioned REST API the renderer talks to.
const API_ORIGIN = new URL(
  (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_API_URL || "http://localhost:8000/api/v1",
).origin;

function getSyncState() {
  const row = db.select().from(syncState).where(eq(syncState.id, 1)).get();
  if (row) return row;
  const initial = { id: 1, lastPulledVersion: 0 };
  db.insert(syncState).values(initial).run();
  return initial;
}

async function pushPending() {
  const pending = getPending();
  if (pending.length === 0) return;

  const outbox = pending.map((row) => {
    const record = JSON.parse(row.payload) as { id: string; syncVersion?: number };
    return {
      action_id: row.id,
      table: row.tableName,
      record_id: record.id,
      operation: row.operation,
      base_version: record.syncVersion ?? 1,
      data: record,
    };
  });

  const { data } = await axios.post(`${API_ORIGIN}/api/v1/sync/push`, {
    device_id: "electron-client",
    outbox,
  });

  const confirmedIds = (data.results ?? [])
    .filter((res: { status: string }) => res.status === "synced")
    .map((res: { action_id: string }) => res.action_id);

  markSynced(confirmedIds);
}

async function pullChanges() {
  const state = getSyncState();
  const { data } = await axios.get(`${API_ORIGIN}/api/v1/sync/pull`, {
    params: { since: state.lastPulledVersion },
  });

  // Server is expected to echo rows back in the same camelCase shape the
  // outbox payloads were pushed in (see productionRepository.ts), so they
  // can be upserted directly against the drizzle schema.
  for (const row of data.changes?.workOrders ?? []) {
    db.insert(workOrders)
      .values(row)
      .onConflictDoUpdate({ target: workOrders.id, set: row })
      .run();
  }
  for (const row of data.changes?.inventoryMovements ?? []) {
    db.insert(inventoryMovements)
      .values(row)
      .onConflictDoUpdate({ target: inventoryMovements.id, set: row })
      .run();
  }

  db.update(syncState)
    .set({ lastPulledVersion: data.serverVersion ?? state.lastPulledVersion })
    .where(eq(syncState.id, 1))
    .run();
}

export async function runSyncCycle() {
  try {
    await pushPending();
    await pullChanges();
  } catch (err) {
    // The Laravel endpoints may not exist yet, or the host may be
    // unreachable while offline — sync is best-effort and must never
    // crash the app or block local reads/writes.
    // Node's connect errors surface as an AggregateError whose own
    // `.message` is empty, so prefer `.code` (e.g. ECONNREFUSED) and fall
    // back to `.message` for HTTP-level failures (4xx/5xx from axios).
    const reason = (err as { code?: string; message?: string }).code ??
      (err as Error).message;
    console.error("[sync] cycle failed:", reason);
  }
}

export function registerSyncHandlers() {
  ipcMain.handle("sync:now", () => runSyncCycle());
}
