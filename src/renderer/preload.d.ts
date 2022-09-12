import { Channels } from 'main/preload';

declare global {
  interface Service {
    id: string;
    name: string;
    website: string;
    logo: string | null;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        delete: (key: string) => void;
      };
    };
    crawler: {
      listAvailableServices: () => Promise<Record<string, Service>>;
      verifyAccount: (
        serviceId: string,
        username: string,
        password: string
      ) => Promise<boolean>;
    };
  }
}

export {};
