// This is not a real database but only a wrapper of file system.

import { ipcMain, shell } from 'electron';
import type { ItemAbstract, Auth } from 'main/services';
import fs from 'fs';
import path from 'path';
import Bluebird from 'bluebird';
import { download } from '../utils/crawler';

export interface DatabaseServiceItem {
  itemAbstract: ItemAbstract;
  localThumbnail: string | null;
  status: string | null;
}

ipcMain.handle(
  'database-create-item-folder',
  async (
    _event,
    libraryLocation: string,
    serviceId: string,
    auth: Auth,
    itemAbstract: ItemAbstract
  ): Promise<void> => {
    const itemPath = path.join(libraryLocation, serviceId, itemAbstract.id);
    if (!fs.existsSync(itemPath)) {
      await fs.promises.mkdir(itemPath, { recursive: true });
    }
    await download(
      itemAbstract.thumbnail,
      {
        auth: `${auth.username}:${auth.password}`,
      },
      itemPath,
      'thumbnail'
    );
    const data = JSON.stringify(itemAbstract);
    await fs.promises.writeFile(path.join(itemPath, 'data.json'), data);
  }
);

ipcMain.handle(
  'database-read-service-folder',
  async (
    _event,
    libraryLocation: string,
    serviceId: string
  ): Promise<Array<DatabaseServiceItem>> => {
    const servicePath = path.join(libraryLocation, serviceId);

    if (!fs.existsSync(servicePath)) {
      return [];
    }

    const subfolders = (
      await fs.promises.readdir(servicePath, {
        withFileTypes: true,
      })
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const itemAbstracts = subfolders
      .filter((subfolder) =>
        fs.existsSync(path.join(servicePath, subfolder, 'data.json'))
      )
      .map((subfolder) => {
        const fullPath = path.join(servicePath, subfolder);
        const dataPath = path.join(fullPath, 'data.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);
        if (subfolder !== data.id) {
          return null;
        }
        return data;
      })
      .filter((itemAbstract) => itemAbstract != null);
    const list = await Bluebird.map(
      itemAbstracts,
      async (itemAbstract) => {
        const itemPath = path.join(servicePath, itemAbstract.id);
        const files = await fs.promises.readdir(itemPath, {
          withFileTypes: true,
        });
        const thumbnail = files.find(
          (file) => path.parse(file.name).name === 'thumbnail'
        );
        let localThumbnail = null;
        try {
          const base64 = fs
            .readFileSync(path.join(itemPath, thumbnail?.name ?? ''))
            .toString('base64');
          localThumbnail = `data:image/png;base64,${base64}`;
        } catch (e) {
          /* ignore */
        }
        const status =
          files
            .find((file) => file.name.startsWith('status-'))
            ?.name?.split('-')?.[1] ?? null;
        return {
          itemAbstract,
          localThumbnail,
          status,
        };
      },
      { concurrency: 1 }
    );

    list.sort((a, b) => {
      if (a.itemAbstract.id > b.itemAbstract.id) {
        return -1;
      }
      if (a.itemAbstract.id < b.itemAbstract.id) {
        return 1;
      }
      return 0;
    });
    return list;
  }
);

ipcMain.handle(
  'database-open-item-folder',
  async (
    _event,
    libraryLocation: string,
    serviceId: string,
    itemAbstract: ItemAbstract
  ): Promise<void> => {
    const itemPath = path.join(libraryLocation, serviceId, itemAbstract.id);
    if (!fs.existsSync(itemPath)) {
      throw new Error('Folder not exist');
    }
    shell.openPath(itemPath);
  }
);
