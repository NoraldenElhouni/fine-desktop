import { create } from "zustand";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "downloaded"
  | "error";

interface UpdateState {
  status: UpdateStatus;
  version?: string;
  progressPercent: number;
  downloadSpeed?: string;
  errorMessage: string | null;
  setStatus: (status: UpdateStatus, version?: string) => void;
  setProgress: (percent: number, speed?: string) => void;
  setError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  status: "idle" as UpdateStatus,
  version: undefined as string | undefined,
  progressPercent: 0,
  downloadSpeed: undefined as string | undefined,
  errorMessage: null as string | null,
};

export const useUpdateStore = create<UpdateState>((set) => ({
  ...initialState,
  setStatus: (status, version) =>
    set((state) => ({
      status,
      version: version ?? state.version,
      progressPercent: status === "downloaded" ? 100 : state.progressPercent,
    })),
  setProgress: (percent, speed) =>
    set({
      status: "downloading",
      progressPercent: Math.min(100, Math.max(0, percent)),
      downloadSpeed: speed,
    }),
  setError: (message) => set({ status: "error", errorMessage: message }),
  reset: () => set({ ...initialState }),
}));
