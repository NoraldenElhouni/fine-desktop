import { create } from "zustand";

export type UpdateStatus = "idle" | "checking" | "downloading" | "downloaded" | "error";

export interface UpdateDetails {
  currentVersion: string;
  requiredVersion: string;
  latestVersion?: string;
  updateUrl?: string;
  directDownloadUrl?: string;
  status: UpdateStatus;
  progressPercent: number;
  downloadSpeed?: string;
  errorMessage?: string | null;
}

interface UpdateState {
  isForceUpdateRequired: boolean;
  details: UpdateDetails;
  setForceUpdate: (required: boolean, details?: Partial<UpdateDetails>) => void;
  setProgress: (percent: number, speed?: string) => void;
  setStatus: (status: UpdateStatus, errorMessage?: string | null) => void;
  reset: () => void;
}

const defaultDetails: UpdateDetails = {
  currentVersion: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.24",
  requiredVersion: "",
  latestVersion: "",
  updateUrl: "https://github.com/NoraldenElhouni/fine-desktop/releases/latest",
  status: "idle",
  progressPercent: 0,
  downloadSpeed: "",
  errorMessage: null,
};

export const useUpdateStore = create<UpdateState>((set) => ({
  isForceUpdateRequired: false,
  details: { ...defaultDetails },
  setForceUpdate: (required, newDetails) =>
    set((state) => ({
      isForceUpdateRequired: required,
      details: {
        ...state.details,
        ...(newDetails || {}),
        status: newDetails?.status ?? (required ? "checking" : state.details.status),
      },
    })),
  setProgress: (percent, speed) =>
    set((state) => ({
      details: {
        ...state.details,
        status: "downloading",
        progressPercent: Math.min(100, Math.max(0, percent)),
        downloadSpeed: speed || state.details.downloadSpeed,
      },
    })),
  setStatus: (status, errorMessage = null) =>
    set((state) => ({
      details: {
        ...state.details,
        status,
        errorMessage: errorMessage !== undefined ? errorMessage : state.details.errorMessage,
        progressPercent: status === "downloaded" ? 100 : state.details.progressPercent,
      },
    })),
  reset: () =>
    set({
      isForceUpdateRequired: false,
      details: { ...defaultDetails },
    }),
}));
