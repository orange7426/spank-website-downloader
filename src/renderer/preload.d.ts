import { Channels } from 'main/preload';
import type {
  Auth as _Auth,
  ItemAbstract as _ItemAbstract,
  ItemContent as _ItemContent,
} from 'main/services/index';
import type { DatabaseServiceItem as _DatabaseServiceItem } from 'main/controllers/database';
import { IpcRendererEvent } from 'electron';
import { Task } from 'main/controllers/downloadManager';

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
  type DownloadManagerTask = Task;

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
      pullItemContent: (
        serviceId: string,
        auth: Auth,
        itemAbstract: ItemAbstract
      ) => Promise<ItemContent>;
      openWebpage: (url: string) => Promise<void>;
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
      setItemStatus: (
        libraryLocation: string,
        serviceId: string,
        itemAbstract: ItemAbstract,
        newStatus: string
      ) => Promise<void>;
    };
    downloadManager: {
      onTaskListUpdated: (
        callback: (
          event: IpcRendererEvent,
          tasks: Array<DownloadManagerTask>
        ) => void
      ) => void;
      download: (
        libraryLocation: string,
        serviceId: string,
        itemId: string,
        uuid: string,
        auth: Auth,
        url: string,
        localPath: string
      ) => Promise<DownloadManagerTask>;
    };
  }
}

export {};
