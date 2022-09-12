import { dialog, ipcMain } from 'electron';

ipcMain.handle('preferences-select-library-location', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths[0];
});
