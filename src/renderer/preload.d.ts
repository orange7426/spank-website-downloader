import { Channels } from 'main/preload';
import type { Auth as _Auth, Item as _Item } from 'main/services/index';

declare global {
  interface Service {
    id: string;
    name: string;
    website: string;
    logo: string | null;
  }

  type Auth = _Auth;
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
    crawler: {
      listAvailableServices: () => Promise<Record<string, Service>>;
      verifyAccount: (serviceId: string, auth: Auth) => Promise<boolean>;
      pullList: (
        serviceId: string,
        auth: Auth,
        page: string | undefined
      ) => Promise<{
        list: Array<Item>;
        nextPage: string | null;
      }>;
    };
    preferences: {
      selectLibraryLocation: () => Promise<string>;
    };
    database: {
      createItemFolder: (
        libraryLocation: string,
        serviceId: string,
        auth: Auth,
        item: Item
      ) => Promise<void>;
      readServiceFolder: (
        libraryLocation: string,
        serviceId: string
      ) => Promise<
        Array<{
          item: Item;
          localThumbnail: string | null;
          status: string | null;
        }>
      >;
      openItemFolder: (
        libraryLocation: string,
        serviceId: string,
        item: Item
      ) => Promise<void>;
    };
  }
}

export {};
