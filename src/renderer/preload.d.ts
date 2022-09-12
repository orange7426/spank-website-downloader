import { Channels } from 'main/preload';
import type { Item as _Item } from 'main/services/index';

declare global {
  interface Service {
    id: string;
    name: string;
    website: string;
    logo: string | null;
  }

  type Item = _Item;

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
    preferences: {
      selectLibraryLocation: () => Promise<string>;
    };
    crawler: {
      listAvailableServices: () => Promise<Record<string, Service>>;
      verifyAccount: (
        serviceId: string,
        username: string,
        password: string
      ) => Promise<boolean>;
      pullList: (
        serviceId: string,
        username: string,
        password: string,
        page: string | undefined
      ) => Promise<{
        list: Array<Item>;
        nextPage: string | null;
      }>;
    };
  }
}

export {};
