/* eslint-disable no-constant-condition, no-await-in-loop */
import Bluebird from 'bluebird';
import { store } from 'renderer/store';
import {
  pullServiceFolder,
  update as updateDatabaseCache,
  updateItemStatus,
} from 'renderer/store/database';
import _partition from 'lodash/partition';
import { toaster } from 'renderer/services/toaster';
import { Intent } from '@blueprintjs/core';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 1,
});

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

export const pullIncrementalUpdates = async (serviceId: string, auth: Auth) => {
  toaster.show({
    message: `Contacting ${serviceId}`,
    icon: 'more',
  });

  // Refresh data from disk
  await store.dispatch(pullServiceFolder(serviceId));

  // Pull current ids
  const { items } = store.getState().database.services[serviceId];
  const existingIds = items.map((item) => item.itemAbstract.id);

  // Pending items for folder creation
  const pendingItemAbstracts = [];

  let nextPage: string | undefined;
  while (true) {
    const res = await window.crawler.pullList(serviceId, auth, nextPage);
    nextPage = res.nextPage ?? undefined;
    const [, newItems] = _partition(res.list, (item) =>
      existingIds.includes(item.id)
    );

    // Insert new items into database with [new] status
    pendingItemAbstracts.push(...newItems);
    const updatedItems = mergeAndSortItems(
      items,
      pendingItemAbstracts.map((itemAbstract) => ({
        itemAbstract,
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
    message: `Found ${pendingItemAbstracts.length} new items. Start persisting.`,
    icon: 'floppy-disk',
  });

  const { libraryLocation } = store.getState().preferences;
  await Bluebird.map(
    pendingItemAbstracts,
    async (itemAbstract) => {
      await window.database.createItemFolder(
        libraryLocation,
        serviceId,
        auth,
        itemAbstract
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

const downloadItem = async (
  serviceId: string,
  auth: Auth,
  itemAbstract: ItemAbstract
) => {
  const { libraryLocation } = store.getState().preferences;
  console.log('Download Item', itemAbstract);

  await store.dispatch(
    updateItemStatus({
      serviceId,
      itemId: itemAbstract.id,
      newStatus: 'analyzing',
    })
  );

  // TODO: Check if item has been downloaded
  const itemContent = await window.crawler.pullItemContent(
    serviceId,
    auth,
    itemAbstract
  );
  console.log(itemContent);

  await store.dispatch(
    updateItemStatus({
      serviceId,
      itemId: itemAbstract.id,
      newStatus: 'downloading',
    })
  );

  await store.dispatch(
    updateItemStatus({
      serviceId,
      itemId: itemAbstract.id,
      newStatus: 'downloaded',
    })
  );
};

export const enqueueDownloadItem = async (
  serviceId: string,
  auth: Auth,
  itemAbstract: ItemAbstract
) => {
  await store.dispatch(
    updateItemStatus({
      serviceId,
      itemId: itemAbstract.id,
      newStatus: 'downloadpending',
    })
  );
  queue.add(() => downloadItem(serviceId, auth, itemAbstract));
};
