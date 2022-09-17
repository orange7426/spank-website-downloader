// Simple download manager.
// TODO: Use Aria2

import { ipcMain } from 'electron';
import BetterQueue from 'better-queue';
import MemoryStore from 'better-queue-memory';
import path from 'path';
import { download } from '../utils/crawler';

export interface Task {
  uuid: string;
  url: string;
  auth: Auth;
  path: string;
  total: number | null;
  downloaded: number;
  status: 'queued' | 'downloading' | 'completed';
}

const tasks: Record<string, Task> = {};

const queue = new BetterQueue(
  (task: Task, callback: (error: Error | null) => void) => {
    const { uuid, auth, url, path: fullPath } = task;
    console.log(`Downloading ${uuid}`);
    tasks[uuid].status = 'downloading';
    // TODO: Send per-file progress: download-manager-update-task-list
    download(
      url,
      { auth: `${auth.username}:${auth.password}` },
      path.dirname(fullPath),
      path.basename(fullPath)
    )
      // eslint-disable-next-line promise/always-return
      .then(() => {
        // eslint-disable-next-line promise/no-callback-in-promise
        callback(null);
      })
      .catch((err) => {
        // eslint-disable-next-line promise/no-callback-in-promise
        callback(err);
      });
  },
  {
    id: 'uuid',
    concurrent: 3,
    store: new MemoryStore(),
  }
);

ipcMain.handle(
  'download-manager-download',
  async (
    _event,
    libraryLocation: string,
    serviceId: string,
    itemId: string,
    uuid: string,
    auth: Auth,
    url: string,
    localPath: string
  ): Promise<Task> => {
    const fullPath = path.join(libraryLocation, serviceId, itemId, localPath);
    console.log(`Enqueue ${fullPath}`);
    const task: Task = {
      uuid,
      url,
      auth,
      path: fullPath,
      total: null,
      downloaded: 0,
      status: 'queued',
    };
    tasks[uuid] = task;
    await new Promise((resolve, reject) => {
      queue
        .push(task)
        .on('finish', (result: void) => {
          resolve(result);
        })
        .on('failed', (err: Error) => {
          reject(err);
        });
    });
    tasks[uuid].status = 'completed';
    const completedTask = tasks[uuid];
    delete tasks[uuid];
    return completedTask;
  }
);
