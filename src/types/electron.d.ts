export {};

declare global {
  interface Window {
    electronAPI: {
      production: {
        createOrder: (
          sku: string,
          qty: number,
        ) => Promise<{
          id: string;
          productSku: string;
          quantity: number;
          status: string;
          createdAt: string;
        }>;
        completeOrder: (
          id: string,
          consumedSku: string,
          consumedQty: number,
        ) => Promise<{
          id: string;
          productSku: string;
          quantity: number;
          status: string;
          createdAt: string;
        }>;
        getStock: (sku: string) => Promise<number>;
        getOpenOrders: () => Promise<Array<{
          id: string;
          productSku: string;
          quantity: number;
          status: string;
          createdAt: string;
        }>>;
      };
      sync: {
        syncNow: () => Promise<void>;
        setToken: (token: string | null) => Promise<void>;
        getLastSyncTime: () => Promise<string | null>;
      };
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
