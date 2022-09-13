/* eslint-disable no-constant-condition, no-await-in-loop */
import Bluebird from 'bluebird';
import { store } from 'renderer/store';
import {
  DatabaseServiceItem,
  pullServiceFolder,
  update as updateDatabaseCache,
} from 'renderer/store/database';
import _partition from 'lodash/partition';
import { toaster } from 'renderer/services/toaster';
import { Intent } from '@blueprintjs/core';

const mergeAndSortItems = (
  ...items: Array<Array<DatabaseServiceItem>>
): Array<DatabaseServiceItem> => {
  const merged = Array.prototype.concat.apply([], items);
  merged.sort((a, b) => {
    if (a.item.id > b.item.id) {
      return -1;
    }
    if (a.item.id < b.item.id) {
      return 1;
    }
    return 0;
  });
  return merged;
};

const pullIncrementalUpdates = async (serviceId: string, auth: Auth) => {
  toaster.show({
    message: `Contacting ${serviceId}`,
    icon: 'more',
  });

  // Refresh data from disk
  await store.dispatch(pullServiceFolder(serviceId));

  // Pull current ids
  const { items } = store.getState().database.services[serviceId];
  const existingIds = items.map((item) => item.item.id);

  // Pending items for folder creation
  const pendingItems = [];

  let nextPage: string | undefined;
  while (true) {
    const res = await window.crawler.pullList(serviceId, auth, nextPage);
    nextPage = res.nextPage ?? undefined;
    const [, newItems] = _partition(res.list, (item) =>
      existingIds.includes(item.id)
    );

    // Insert new items into database with [new] status
    pendingItems.push(...newItems);
    const updatedItems = mergeAndSortItems(
      items,
      pendingItems.map((item) => ({
        item,
        localThumbnail: null,
        status: 'persistpending',
      }))
    );
    await store.dispatch(
      updateDatabaseCache({
        serviceId,
        serviceState: {
          items: updatedItems,
        },
      })
    );

    if (newItems.length === 0 || nextPage == null) break;
  }

  toaster.show({
    message: `Found ${pendingItems.length} new items. Start persisting.`,
    icon: 'floppy-disk',
  });

  const { libraryLocation } = store.getState().preferences;
  await Bluebird.map(
    pendingItems,
    async (item) => {
      await window.database.createItemFolder(
        libraryLocation,
        serviceId,
        auth,
        item
      );
    },
    { concurrency: 1 }
  );

  await store.dispatch(pullServiceFolder(serviceId));

  toaster.show({
    message: `Pulling succeed.`,
    icon: 'tick',
    intent: Intent.SUCCESS,
  });
};

export default {
  pullIncrementalUpdates,
};
