import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ItemAbstract } from './services';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    delete(property: string) {
      ipcRenderer.send('electron-store-delete', property);
    },
  },
});

contextBridge.exposeInMainWorld('crawler', {
  listAvailableServices: () =>
    ipcRenderer.invoke('crawler-list-available-services'),
  verifyAccount: (serviceId: string, auth: Auth) =>
    ipcRenderer.invoke('crawler-verify-account', serviceId, auth),
  pullList: (serviceId: string, auth: Auth, page: string | undefined) =>
    ipcRenderer.invoke('crawler-pull-list', serviceId, auth, page),
});

contextBridge.exposeInMainWorld('database', {
  createItemFolder: (
    libraryLocation: string,
    serviceId: string,
    auth: Auth,
    itemAbstract: ItemAbstract
  ) =>
    ipcRenderer.invoke(
      'database-create-item-folder',
      libraryLocation,
      serviceId,
      auth,
      itemAbstract
    ),
  readServiceFolder: (libraryLocation: string, serviceId: string) =>
    ipcRenderer.invoke(
      'database-read-service-folder',
      libraryLocation,
      serviceId
    ),
  openItemFolder: (
    libraryLocation: string,
    serviceId: string,
    itemAbstract: ItemAbstract
  ) =>
    ipcRenderer.invoke(
      'database-open-item-folder',
      libraryLocation,
      serviceId,
      itemAbstract
    ),
});

contextBridge.exposeInMainWorld('preferences', {
  selectLibraryLocation: () =>
    ipcRenderer.invoke('preferences-select-library-location'),
});
