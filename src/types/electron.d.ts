export {};

export interface UpdateProgressData {
  percent: number;
  speed?: string;
  transferred?: number;
  total?: number;
}

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      setFullscreen: (flag: boolean) => void;
      onNetworkChange: (cb: (online: boolean) => void) => void;
      showNotification: (title: string, body: string) => void;

      // Auto-updater methods & listeners (electron-updater, GitHub releases)
      checkForUpdates: () => Promise<{ success: boolean; message?: string }>;
      installUpdateAndRestart: () => Promise<void>;
      onUpdateStatus: (cb: (status: string, version?: string) => void) => () => void;
      onUpdateProgress: (cb: (data: UpdateProgressData) => void) => () => void;
      onUpdateDownloaded: (cb: (version?: string) => void) => () => void;
      onUpdateError: (cb: (errorMsg: string) => void) => () => void;
    };
  }
}
