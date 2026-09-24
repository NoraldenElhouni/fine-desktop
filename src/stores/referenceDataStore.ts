import { create } from "zustand";
import { LookupEntry, REFERENCE_LOOKUPS } from "../config/referenceLookups";

/**
 * TEMPORARY in-memory store behind every reference list under Settings
 * (وحدات القياس، العملات، المصارف، الجنسيات …). Seeded from the dummy rows in
 * `src/config/referenceLookups.ts`; edits live for the session only.
 *
 * Delete once each list has a real endpoint + TanStack Query hook.
 */

export type LookupDraft = Omit<LookupEntry, "id">;

interface ReferenceDataState {
  entries: Record<string, LookupEntry[]>;
  addEntry: (lookupKey: string, draft: LookupDraft) => void;
  updateEntry: (lookupKey: string, id: string, draft: LookupDraft) => void;
  removeEntry: (lookupKey: string, id: string) => void;
  toggleActive: (lookupKey: string, id: string) => void;
}

const seedEntries = (): Record<string, LookupEntry[]> =>
  Object.fromEntries(REFERENCE_LOOKUPS.map((lookup) => [lookup.key, lookup.seed]));

const nextId = (lookupKey: string): string =>
  `${lookupKey}-${Math.random().toString(36).slice(2, 9)}`;

export const useReferenceDataStore = create<ReferenceDataState>((set) => ({
  entries: seedEntries(),
  addEntry: (lookupKey, draft) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [lookupKey]: [
          { ...draft, id: nextId(lookupKey) },
          ...(state.entries[lookupKey] ?? []),
        ],
      },
    })),
  updateEntry: (lookupKey, id, draft) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [lookupKey]: (state.entries[lookupKey] ?? []).map((entry) =>
          entry.id === id ? { ...draft, id } : entry,
        ),
      },
    })),
  removeEntry: (lookupKey, id) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [lookupKey]: (state.entries[lookupKey] ?? []).filter((entry) => entry.id !== id),
      },
    })),
  toggleActive: (lookupKey, id) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [lookupKey]: (state.entries[lookupKey] ?? []).map((entry) =>
          entry.id === id ? { ...entry, isActive: !entry.isActive } : entry,
        ),
      },
    })),
}));
