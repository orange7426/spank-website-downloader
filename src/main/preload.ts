import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
    item: Item
  ) =>
    ipcRenderer.invoke(
      'database-create-item-folder',
      libraryLocation,
      serviceId,
      auth,
      item
    ),
  readServiceFolder: (libraryLocation: string, serviceId: string) =>
    ipcRenderer.invoke(
      'database-read-service-folder',
      libraryLocation,
      serviceId
    ),
});

contextBridge.exposeInMainWorld('preferences', {
  selectLibraryLocation: () =>
    ipcRenderer.invoke('preferences-select-library-location'),
});
