# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Electron 43 + React 19 + TypeScript desktop client ("fine-desktop") for **Fine** — a five-unit foam-to-furniture manufacturer (Procurement/Treasury, Foam, Cutter, Furniture, Store/Showroom). UI copy is Arabic, RTL-first. All ten implementation phases are built (see `../HANDOFF.md` for the authoritative status; the backend lives in the sibling `fine_backend` repo, on a **different GitHub account** — Nick-800 vs NoraldenElhouni).

**Architecture is online-only.** The offline-first local SQLite / outbox / sync design was removed on 2026-08-04. There is no local database, no sync loop, and no `/api/sync/*` anything. Every read and write goes to the Laravel API at `/api/v1` over HTTPS. If you find documentation or a branch describing Drizzle, outbox tables, or a 3-tier sync guide, it is dead history.

## Commands

```bash
npm install
npm start         # electron-forge start — dev mode, hot reload, opens DevTools
npm run lint      # eslint --ext .ts,.tsx .   (0 errors expected; ~33 legacy warnings are known)
npx tsc --noEmit  # type check (expected clean)
npm run package   # electron-forge package (no installer)
npm run make      # electron-forge make (installers)
```

There is no test suite. Verification is `tsc` + `eslint` + a live click-test:
**Click-testing without Electron**: `npx vite --config vite.renderer.config.ts --port 5199` — nothing in src/ requires electronAPI. Log in through the UI, or set localStorage keys `fine_server_url`, `fine_auth_token`, `fine_auth_user`, `fine_operating_unit_id` (login response field is `access_token`).

Dev API defaults to `https://api.fine.shards.ly`; override with `VITE_API_URL` in `.env`. During a local click-test point `fine_server_url` at a local backend (e.g. `http://127.0.0.1:8010/api/v1` — see backend HANDOFF for how to run one against a scratch DB).

## Process split

Three Vite builds wired via `forge.config.ts`:

- `src/main.ts` — Electron main: BrowserWindow (contextIsolation, sandbox, no nodeIntegration), CSP headers, registers the one legacy IPC handler set.
- `src/preload.ts` — the only renderer↔main bridge (`contextBridge` → `window.electronAPI`); its shape is mirrored in `src/types/electron.d.ts` — keep both in sync.
- `src/index.tsx` / `renderer.ts` — the React app. **All real features live here and talk REST directly.**

`src/repositories/` + `src/ipc/` are a vestigial demo slice from the offline era; `productionRepository` is now a thin REST passthrough. Don't extend this pattern — new features go through the renderer module pattern below.

## The module pattern (copy this for anything new)

1. `src/api/endpoints/X.ts` — types + an api object over `apiClient` (`src/api/client.ts`).
2. `src/hooks/useX.ts` — TanStack Query hooks; mutations invalidate the query keys they affect.
3. `src/pages/x/*.tsx` — pages.
4. `src/routes/XRoutes.tsx` — route module, registered in `src/pages/App.tsx` **and** `src/routes/routes.config.ts` (single source of truth for sidebar nav labels/icons and breadcrumbs).

State: Zustand for client state (`src/stores/`), TanStack Query for server state. The `@/*` path alias exists but is unused — imports are relative; keep it that way.

## The API client (read this before debugging requests)

`src/api/client.ts` interceptors do a lot:
- attach `Authorization: Bearer` from `authStore` (manual localStorage persistence — keep state + storage in sync);
- attach `X-Operating-Unit-ID` from `serverConfigStore`;
- on 401 → force logout; on 403 `MUST_CHANGE_PASSWORD` → forced password-change flow;
- on 400 `INVALID_OPERATING_UNIT` → drop the stale unit id and recover (happens after DB reseeds).

**Unit pinning:** `AppShell` auto-selects the first operating unit whenever none is set — even for the owner. Company-wide screens must therefore not rely on "no unit selected". Detect a company-wide caller with `useIsCompanyWide()` (`src/hooks/useAccounting.ts` — checks `user.roles[].pivot.operating_unit_id === null`) and pass `company_wide=1` on reads that should span units (accounting, fixed assets, overhead, dashboard already do).

**Errors:** backend guard failures are 422 with a `code` (`INVALID_STATE_TRANSITION`, `INSUFFICIENT_COMPONENT_STOCK`, …). Read them with `apiErrorPayload()` from `src/api/endpoints/production.ts` and show the message.

## Styling

Arabic RTL: `bg-app-*` design tokens only, logical properties (`ps-*`, `ms-*`, `text-start/end`) — see `md/STYLING_GUIDE.md`. Lifecycle pages use a status-chip bar plus a single "Advance" action. Money renders `font-mono` via `Number(x).toLocaleString()`.

## What exists (sections in the sidebar)

Dashboard (owner variant `OwnerDashboardPage` for company-wide roles, operational `Dashboard` for unit staff) · entities/suppliers/import-orders/treasury · employees/clients/external-employers · orders/users · inventory · manufacturing (foam batches) · cutter · furniture · sales + POS + restock · HR (attendance, labor rates, payroll, leave) · accounting (journal, CoA, trial balance, overhead, fixed assets) · financial reports.

## Gotchas

- CRLF warnings on commit are noise.
- The frontend phase docs under `docs/` (`FRONTEND_PLAN.md`, `phase-f01..f10`) were written before the build and never reconciled — trust the code and `../HANDOFF.md` over them.
