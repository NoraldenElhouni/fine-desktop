import { create } from "zustand";

/** Receipt printer + cash drawer setup. Per workstation: lives in this machine's localStorage only. */
const PRINT_SETTINGS_KEY = "fine_print_settings";

export type DrawerMode = "printer" | "network";
export type DrawerPin = 0 | 1;

export interface PrintSettings {
  receiptPrinter: string | null;
  receiptCopies: number;
  autoPrintReceipt: boolean;
  openDrawerOnCash: boolean;
  drawerMode: DrawerMode;
  drawerHost: string;
  drawerPort: number;
  /** 0 = drawer pin 2, 1 = drawer pin 5. */
  drawerPin: DrawerPin;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  receiptPrinter: null,
  receiptCopies: 1,
  autoPrintReceipt: false,
  openDrawerOnCash: false,
  drawerMode: "printer",
  drawerHost: "",
  drawerPort: 9100,
  drawerPin: 0,
};

const isLocalStorageAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
};

const clampCopies = (value: unknown): number => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_PRINT_SETTINGS.receiptCopies;
  return Math.min(3, Math.max(1, n));
};

const clampPort = (value: unknown): number => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1 || n > 65535) return DEFAULT_PRINT_SETTINGS.drawerPort;
  return n;
};

/** Whatever localStorage holds is coerced back into a valid settings object. */
const sanitize = (raw: Partial<Record<keyof PrintSettings, unknown>>): PrintSettings => ({
  receiptPrinter:
    typeof raw.receiptPrinter === "string" && raw.receiptPrinter.trim() ? raw.receiptPrinter : null,
  receiptCopies: clampCopies(raw.receiptCopies ?? DEFAULT_PRINT_SETTINGS.receiptCopies),
  autoPrintReceipt: raw.autoPrintReceipt === true,
  openDrawerOnCash: raw.openDrawerOnCash === true,
  drawerMode: raw.drawerMode === "network" ? "network" : "printer",
  drawerHost: typeof raw.drawerHost === "string" ? raw.drawerHost.trim() : "",
  drawerPort: clampPort(raw.drawerPort ?? DEFAULT_PRINT_SETTINGS.drawerPort),
  drawerPin: raw.drawerPin === 1 ? 1 : 0,
});

const getInitialSettings = (): PrintSettings => {
  if (isLocalStorageAvailable()) {
    try {
      const saved = localStorage.getItem(PRINT_SETTINGS_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return sanitize(parsed as Partial<Record<keyof PrintSettings, unknown>>);
        }
      }
    } catch (e) {
      console.error("Failed to read print settings from localStorage", e);
    }
  }
  return { ...DEFAULT_PRINT_SETTINGS };
};

interface PrintSettingsState extends PrintSettings {
  updateSettings: (patch: Partial<PrintSettings>) => void;
}

const pickSettings = (state: PrintSettings): PrintSettings => ({
  receiptPrinter: state.receiptPrinter,
  receiptCopies: state.receiptCopies,
  autoPrintReceipt: state.autoPrintReceipt,
  openDrawerOnCash: state.openDrawerOnCash,
  drawerMode: state.drawerMode,
  drawerHost: state.drawerHost,
  drawerPort: state.drawerPort,
  drawerPin: state.drawerPin,
});

export const usePrintSettingsStore = create<PrintSettingsState>((set, get) => ({
  ...getInitialSettings(),

  updateSettings: (patch: Partial<PrintSettings>) => {
    const next = sanitize({ ...pickSettings(get()), ...patch });
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(PRINT_SETTINGS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save print settings to localStorage", e);
      }
    }
    set(next);
  },
}));

/** The current settings snapshot, for code outside React. */
export const getPrintSettings = (): PrintSettings => pickSettings(usePrintSettingsStore.getState());

/** A drawer is configured when its connection target is set (a network host, or the receipt printer). */
export const isDrawerConfigured = (s: Pick<PrintSettings, "drawerMode" | "drawerHost" | "receiptPrinter">): boolean =>
  s.drawerMode === "network" ? Boolean(s.drawerHost.trim()) : Boolean(s.receiptPrinter);
