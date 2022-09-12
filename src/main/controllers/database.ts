// This is not a real database but only a wrapper of file system.

import { ipcMain } from 'electron';
import type { Item, Auth } from 'main/services';
import fs from 'fs';
import path from 'path';
import { download } from '../utils/crawler';

ipcMain.handle(
  'database-create-item-folder',
  async (
    event,
    libraryLocation: string,
    serviceId: string,
    auth: Auth,
    item: Item
  ) => {
    const itemPath = path.join(libraryLocation, serviceId, item.id);
    if (!fs.existsSync(itemPath)) {
      await fs.promises.mkdir(itemPath, { recursive: true });
    }
    await download(
      item.thumbnail,
      {
        auth: `${auth.username}:${auth.password}`,
      },
      itemPath,
      'thumbnail'
    );
    const data = JSON.stringify(item);
    await fs.promises.writeFile(path.join(itemPath, 'data.json'), data);
  }
);
