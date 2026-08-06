import { create } from "zustand";

const SERVER_URL_KEY = "fine_server_url";
const OPERATING_UNIT_ID_KEY = "fine_operating_unit_id";
const ALLOW_MANUAL_ENTITY_SELECTION_KEY = "fine_allow_manual_entity_selection";

// Default fallback API URL if none is configured in localStorage
const DEFAULT_SERVER_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_URL || "http://localhost:8000/api/v1";

const isLocalStorageAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
};

const getInitialServerUrl = (): string => {
  if (isLocalStorageAvailable()) {
    try {
      const saved = localStorage.getItem(SERVER_URL_KEY);
      if (saved && saved.trim()) {
        return saved.trim();
      }
    } catch (e) {
      console.error("Failed to read server URL from localStorage", e);
    }
  }
  return DEFAULT_SERVER_URL;
};

const getInitialOperatingUnitId = (): string | null => {
  if (isLocalStorageAvailable()) {
    try {
      return localStorage.getItem(OPERATING_UNIT_ID_KEY);
    } catch (e) {
      console.error("Failed to read operating unit ID from localStorage", e);
    }
  }
  return null;
};

const getInitialAllowManualEntitySelection = (): boolean => {
  if (isLocalStorageAvailable()) {
    try {
      return localStorage.getItem(ALLOW_MANUAL_ENTITY_SELECTION_KEY) === "true";
    } catch (e) {
      console.error("Failed to read manual entity selection setting", e);
    }
  }
  return false;
};

interface ServerConfigState {
  serverUrl: string;
  operatingUnitId: string | null;
  allowManualEntitySelection: boolean;
  isServerConnected: boolean;
  isReconnecting: boolean;
  lastConnectionError: string | null;
  setServerUrl: (url: string) => void;
  setOperatingUnitId: (unitId: string | null) => void;
  setAllowManualEntitySelection: (enabled: boolean) => void;
  setServerConnected: (connected: boolean, error?: string | null) => void;
  setReconnecting: (reconnecting: boolean) => void;
}

export const useServerConfigStore = create<ServerConfigState>((set) => ({
  serverUrl: getInitialServerUrl(),
  operatingUnitId: getInitialOperatingUnitId(),
  allowManualEntitySelection: getInitialAllowManualEntitySelection(),
  isServerConnected: true,
  isReconnecting: false,
  lastConnectionError: null,

  setServerUrl: (url: string) => {
    const formatted = url.trim().replace(/\/+$/, "");
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(SERVER_URL_KEY, formatted);
      } catch (e) {
        console.error("Failed to save server URL to localStorage", e);
      }
    }
    set({ serverUrl: formatted });
  },

  setOperatingUnitId: (unitId: string | null) => {
    if (isLocalStorageAvailable()) {
      try {
        if (unitId) {
          localStorage.setItem(OPERATING_UNIT_ID_KEY, unitId);
        } else {
          localStorage.removeItem(OPERATING_UNIT_ID_KEY);
        }
      } catch (e) {
        console.error("Failed to save operating unit ID to localStorage", e);
      }
    }
    set({ operatingUnitId: unitId });
  },

  setAllowManualEntitySelection: (enabled: boolean) => {
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(ALLOW_MANUAL_ENTITY_SELECTION_KEY, String(enabled));
      } catch (e) {
        console.error("Failed to save manual entity selection setting", e);
      }
    }
    set({ allowManualEntitySelection: enabled });
  },

  setServerConnected: (connected: boolean, error: string | null = null) => {
    set({ isServerConnected: connected, lastConnectionError: error });
  },

  setReconnecting: (reconnecting: boolean) => {
    set({ isReconnecting: reconnecting });
  },
}));
