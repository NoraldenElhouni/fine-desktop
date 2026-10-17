import { create } from "zustand";

export interface ForceUpdateInfo {
  code: string;
  message: string;
  message_ar: string;
  current_version: string;
  required_version: string;
  latest_version: string;
  update_url: string;
}

interface UpdateRequiredState {
  info: ForceUpdateInfo | null;
  setRequired: (info: ForceUpdateInfo | null) => void;
}

export const useUpdateRequiredStore = create<UpdateRequiredState>((set) => ({
  info: null,
  setRequired: (info) => set({ info }),
}));
