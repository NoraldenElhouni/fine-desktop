export {};

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<unknown>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      setFullscreen: (flag: boolean) => void;
      onNetworkChange: (cb: (online: boolean) => void) => void;
      showNotification: (title: string, body: string) => void;
    };
  }
}
