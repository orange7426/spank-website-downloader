import { Channels } from 'main/preload';
import type {
  Auth as _Auth,
  ItemAbstract as _ItemAbstract,
  ItemContent as _ItemContent,
} from 'main/services/index';
import type { DatabaseServiceItem as _DatabaseServiceItem } from 'main/controllers/database';

declare global {
  interface Service {
    id: string;
    name: string;
    website: string;
    logo: string | null;
  }

  type Auth = _Auth;
  type ItemAbstract = _ItemAbstract;
  type ItemContent = _ItemContent;
  type DatabaseServiceItem = _DatabaseServiceItem;

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
        list: Array<ItemAbstract>;
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
        itemAbstract: ItemAbstract
      ) => Promise<void>;
      readServiceFolder: (
        libraryLocation: string,
        serviceId: string
      ) => Promise<
        Array<{
          itemAbstract: ItemAbstract;
          localThumbnail: string | null;
          status: string | null;
        }>
      >;
      openItemFolder: (
        libraryLocation: string,
        serviceId: string,
        itemAbstract: ItemAbstract
      ) => Promise<void>;
    };
  }
}

export {};
