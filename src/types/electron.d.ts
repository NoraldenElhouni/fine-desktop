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
      checkForUpdates: () => Promise<unknown>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      setFullscreen: (flag: boolean) => void;
      onNetworkChange: (cb: (online: boolean) => void) => void;
      showNotification: (title: string, body: string) => void;

      // Auto-updater methods & listeners
      startAutoUpdate: (options?: { downloadUrl?: string }) => Promise<{ success: boolean; message?: string }>;
      installUpdateAndRestart: () => Promise<void>;
      downloadDirectInstaller: (url: string) => Promise<{ success: boolean; message?: string }>;
      onUpdateProgress: (cb: (data: UpdateProgressData) => void) => () => void;
      onUpdateDownloaded: (cb: () => void) => () => void;
      onUpdateError: (cb: (errorMsg: string) => void) => () => void;
    };
  }
}
