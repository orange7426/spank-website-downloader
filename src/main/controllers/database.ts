// This is not a real database but only a wrapper of file system.

import { ipcMain } from 'electron';
import type { Item, Auth } from 'main/services';
import fs from 'fs';
import path from 'path';
import url from 'url';
import Bluebird from 'bluebird';
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

ipcMain.handle(
  'database-read-service-folder',
  async (event, libraryLocation: string, serviceId: string) => {
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

    const items = subfolders
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
      .filter((item) => item != null);
    const list = await Bluebird.map(
      items,
      async (item) => {
        const itemPath = path.join(servicePath, item.id);
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
        const status = files
          .find((file) => file.name.startsWith('status-'))
          ?.name?.split('-')?.[1];
        return {
          item,
          localThumbnail,
          status,
        };
      },
      { concurrency: 1 }
    );

    list.sort((a, b) => {
      if (a.item.id > b.item.id) {
        return -1;
      }
      if (a.item.id < b.item.id) {
        return 1;
      }
      return 0;
    });
    return list;
  }
);