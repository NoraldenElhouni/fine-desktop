# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Electron + React 19 + TypeScript desktop client ("fine-desktop") for factory/warehouse/showroom staff of a multi-unit manufacturing ERP. Talks to a separate Laravel API (`fine_backend`, sibling repo — see `/Users/nacho/fine/CLAUDE.md` if present) over HTTPS, with an offline-first local SQLite store. UI copy is Arabic and RTL-facing (see `src/pages/*`, `src/routes/routes.config.ts`).

## Commands

```bash
npm install
npm start        # electron-forge start — dev mode, hot reload, opens DevTools (NODE_ENV=development)
npm run lint      # eslint --ext .ts,.tsx .
npm run package   # electron-forge package (no installer)
npm run make      # electron-forge make (produces installers via forge.config.ts makers)
```

No test suite is configured for this package — there is no `npm test` script and no test runner installed.

Local dev talks to `https://api.fine.shards.ly` by default; override with `VITE_API_URL` in `.env` (see `.env.example`). `vite.renderer.config.ts` also proxies `/api` to that same host during `npm start`.

## Architecture

### Process split

Three separate Vite builds (`vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`, wired via `forge.config.ts`'s `VitePlugin`):

- `src/main.ts` — Electron main process. Creates the `BrowserWindow` with `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`; sets CSP/CORS response headers via `session.defaultSession.webRequest.onHeadersReceived`; registers IPC handlers; kicks off the sync loop (`setInterval(runSyncCycle, 30_000)`) on `app.on("ready")`.
- `src/preload.ts` — the only bridge between renderer and Node/Electron APIs, via `contextBridge.exposeInMainWorld("electronAPI", ...)`. Renderer code must never import Node/DB APIs directly; it only sees what's exposed here. The exposed shape is duplicated as ambient types in `src/types/electron.d.ts` (`Window.electronAPI`) — keep both in sync when adding a bridge method.
- `src/index.tsx` / `src/renderer.ts` — renderer/React entry point.

### Local DB → repository → IPC → renderer-repository pattern

This is the one fully-wired vertical slice to copy when adding a new local-data domain:

1. **Schema**: `src/db/schema.ts` (Drizzle ORM, `drizzle-orm/sqlite-core`). Tables so far: `workOrders`, `inventoryMovements`, `outbox`, `syncState`.
2. **Connection**: `src/db/client.ts` opens `better-sqlite3` at `app.getPath("userData")/erp-local.db` (WAL mode) and runs Drizzle migrations from `src/db/migrations` on startup. Migrations are plain `.sql` files (no `drizzle-kit` config checked in yet) copied next to the bundled `main.js` by `vite-plugin-static-copy` in `vite.main.config.ts`, since Rollup won't bundle raw SQL that nothing `import`s. **Known unresolved issue** (see comment in `client.ts`): once packaged (`npm run make`), `__dirname` resolves inside the asar archive and better-sqlite3/Drizzle can't read migrations from there — needs an `app.isPackaged` branch pointing at an unpacked resource path before shipping.
3. **Repository** (main process, direct DB access): `src/repositories/*.ts`, e.g. `ProductionRepository` in `productionRepository.ts` — plain objects with methods that run Drizzle queries and call `enqueue(...)` (from `src/sync/outbox.ts`) after any write that needs to leave the device.
4. **IPC handler**: `src/ipc/*Handlers.ts` registers `ipcMain.handle(...)` channels that call into the repository. Registered from `main.ts` (`registerProductionHandlers()`).
5. **Preload bridge**: add the channel under the relevant namespace in `src/preload.ts`, and mirror its signature in `src/types/electron.d.ts`.
6. **Renderer-repository**: `src/renderer-repositories/*.ts` — thin wrappers calling `window.electronAPI.<namespace>.<method>()`, imported by pages/components instead of touching `window.electronAPI` directly.

Only the `production` domain (`ProductionRepository` / `productionHandlers` / renderer `productionRepository`) is wired end-to-end right now; treat it as the reference implementation, not as a complete feature set.

### Offline sync

`src/sync/outbox.ts` + `src/sync/syncService.ts` are an early-stage implementation of the design in `FINANCIAL_AWARE_HYBRID_SYNC_GUIDE.md`. **Read that guide before touching sync code** — it defines the target 3-tier data classification (Tier 1 fully offline-writable operational data, Tier 2 read-only cached financial snapshots, Tier 3A strict online-only money movements, Tier 3B provisional POS outbox with a quarantine/conflict-resolution flow) and the intended pull/push wire contracts.

Current reality is much smaller than the guide:
- Only `workOrders` and `inventoryMovements` are synced, via a single generic `outbox` table (`{tableName, operation, payload: JSON string, status}`) and a single-row `syncState` table tracking `lastPulledVersion`.
- `runSyncCycle()` (called every 30s from `main.ts`, and on-demand via the `sync:now` IPC channel) does `pushPending()` (POST accumulated outbox rows to `{API_ORIGIN}/api/sync/push`) then `pullChanges()` (GET `{API_ORIGIN}/api/sync/pull?since=...}`, upserting rows back by primary key). `API_ORIGIN` is derived from `VITE_API_URL`'s origin — note the sync endpoints are unversioned `/api/sync/*`, a different route group from the versioned `/api/v1/*` REST endpoints the renderer's axios client uses.
- **The backend has no `/api/sync/*` controller/routes implemented yet** — check the `fine_backend` sibling repo's `routes/api.php` before assuming an endpoint exists. Sync failures (unreachable host, missing route) are swallowed and logged (`console.error("[sync] cycle failed:", ...)`) — sync must never crash the app or block local reads/writes.

### Remote API layer

`src/api/client.ts` is an axios instance (`baseURL` from `VITE_API_URL`, default `https://api.fine.shards.ly/api/v1`) used by the renderer for the versioned REST API (distinct from the sync endpoints above):
- Request interceptor attaches `Authorization: Bearer <token>` from `useAuthStore` (Zustand, `src/stores/authStore.ts`).
- Response interceptor force-logs-out on `401`, and on `403` with `code === "MUST_CHANGE_PASSWORD"` flags `must_change_password` on the stored user (drives a forced password-change flow in the UI).
- `authStore` persists `token`/`user` to `localStorage` manually (not Zustand's `persist` middleware) — keep both branches (state + localStorage) in sync if you change its shape.
- Per-resource calls live in `src/api/endpoints/*.ts` (`entities`, `employees`, `clients`, `externalEmployers`, `operatingUnits`, `inventory/`), mirroring the backend's `/api/v1` resources.

### Routing & navigation

`react-router-dom` route modules per domain in `src/routes/*Routes.tsx`, registered into `src/routes/routes.config.ts`, which is also the single source of truth for the sidebar nav (`navItems`, Arabic labels + `lucide-react` icons) and breadcrumb derivation (`getBreadcrumbEntries`). When adding a new top-level section, add it to `navItems` here rather than hardcoding nav links elsewhere.

### State management

Zustand for client/local state (`src/stores/`), TanStack Query for server state/caching. Path alias `@/*` is declared in every Vite config's `resolve.alias`, but nothing in the codebase actually uses `@/...` imports — imports are relative in practice; don't introduce `@/` imports without updating this pattern deliberately across the board.
