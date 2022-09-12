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

contextBridge.exposeInMainWorld('preferences', {
  selectLibraryLocation: () =>
    ipcRenderer.invoke('preferences-select-library-location'),
});

contextBridge.exposeInMainWorld('crawler', {
  listAvailableServices: () =>
    ipcRenderer.invoke('crawler-list-available-services'),
  verifyAccount: (serviceId: string, username: string, password: string) =>
    ipcRenderer.invoke('crawler-verify-account', serviceId, username, password),
  pullList: (
    serviceId: string,
    username: string,
    password: string,
    page: string | undefined
  ) =>
    ipcRenderer.invoke(
      'crawler-pull-list',
      serviceId,
      username,
      password,
      page
    ),
});
