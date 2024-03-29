/* eslint-disable no-constant-condition, no-await-in-loop */
import Bluebird from 'bluebird';
import { store } from 'renderer/store';
import {
  pullServiceFolder,
  update as updateDatabaseCache,
  patchItem,
  update,
} from 'renderer/store/database';
import _partition from 'lodash/partition';
import { toaster } from 'renderer/services/toaster';
import { Intent } from '@blueprintjs/core';
import PQueue from 'p-queue';
import { v4 as uuidv4 } from 'uuid';

const queue = new PQueue({
  concurrency: 1,
});

const mergeAndSortItems = (
  ...items: Array<Array<DatabaseServiceItem>>
): Array<DatabaseServiceItem> => {
  const merged = Array.prototype.concat.apply([], items);
  merged.sort((a, b) => {
    if (a.itemAbstract.id > b.itemAbstract.id) {
      return -1;
    }
    if (a.itemAbstract.id < b.itemAbstract.id) {
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

    await store.dispatch(
      update({
        serviceId,
        serviceState: {
          progress: {
            total: pendingItemAbstracts.length,
            completed: 0,
          },
        },
      })
    );

    if (newItems.length === 0 || nextPage == null) break;
  }

  // NOTE: Technically, the pulled items from service need to be deduped because
  // pulling process can take long time. Since we are creating folder using
  // *unique* key, OS will dedup the result for us automatically.

  toaster.show({
    message: `Found ${pendingItemAbstracts.length} new items. Start persisting.`,
    icon: 'floppy-disk',
  });

  const { libraryLocation } = store.getState().preferences;
  let completed = 0;
  await Bluebird.map(
    pendingItemAbstracts,
    async (itemAbstract) => {
      await window.database.createItemFolder(
        libraryLocation,
        serviceId,
        auth,
        itemAbstract
      );
      completed += 1;
      await store.dispatch(
        update({
          serviceId,
          serviceState: {
            progress: {
              total: pendingItemAbstracts.length,
              completed,
            },
          },
        })
      );
    },
    { concurrency: 1 }
  );

  await store.dispatch(pullServiceFolder(serviceId));

  await store.dispatch(
    update({
      serviceId,
      serviceState: {
        progress: null,
      },
    })
  );

  toaster.show({
    message: `Pulling succeed.`,
    icon: 'tick',
    intent: Intent.SUCCESS,
  });
};

const downloadItemImpl = async (
  serviceId: string,
  auth: Auth,
  itemAbstract: ItemAbstract
) => {
  try {
    const { libraryLocation } = store.getState().preferences;

    await store.dispatch(
      patchItem({
        serviceId,
        itemId: itemAbstract.id,
        patch: { status: 'analyzing' },
      })
    );

    // TODO: Check if item has been downloaded
    const itemContent = await window.crawler.pullItemContent(
      serviceId,
      auth,
      itemAbstract
    );

    await store.dispatch(
      patchItem({
        serviceId,
        itemId: itemAbstract.id,
        patch: {
          status: 'downloading',
          progress: {
            total: itemContent.length,
            completed: 0,
          },
        },
      })
    );

    let completed = 0;

    await Bluebird.map(
      itemContent,
      async (media) => {
        // TODO: Progress bar
        await window.downloadManager.download(
          libraryLocation,
          serviceId,
          itemAbstract.id,
          uuidv4(),
          auth,
          media.url,
          media.destination
        );
        completed += 1;
        await store.dispatch(
          patchItem({
            serviceId,
            itemId: itemAbstract.id,
            patch: {
              progress: {
                total: itemContent.length,
                completed,
              },
            },
          })
        );
      },
      {
        // Set concurrent 10 to prevent IPC panic
        concurrency: 10,
      }
    );

    await window.database.setItemStatus(
      libraryLocation,
      serviceId,
      itemAbstract,
      'downloaded'
    );

    await store.dispatch(
      patchItem({
        serviceId,
        itemId: itemAbstract.id,
        patch: { status: 'downloaded', progress: null },
      })
    );
  } catch (e) {
    if (e instanceof Error) {
      toaster.show({
        message: `Failed to download [${serviceId}][${itemAbstract.title}]. Error message: ${e.message}`,
        intent: Intent.DANGER,
        icon: 'warning-sign',
      });
    }
    await store.dispatch(
      patchItem({
        serviceId,
        itemId: itemAbstract.id,
        patch: { status: 'failed' },
      })
    );
  }
};

export const downloadItem = async (
  serviceId: string,
  auth: Auth,
  itemAbstract: ItemAbstract
) => {
  await store.dispatch(
    patchItem({
      serviceId,
      itemId: itemAbstract.id,
      patch: { status: 'downloadpending' },
    })
  );
  await queue.add(() => downloadItemImpl(serviceId, auth, itemAbstract));
};
