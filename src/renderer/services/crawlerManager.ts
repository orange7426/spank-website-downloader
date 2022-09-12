import Bluebird from 'bluebird';
import { store } from 'renderer/store';

const pullIncrementalUpdates = async (serviceId: string, auth: Auth) => {
  const { libraryLocation } = store.getState().preferences;
  const res = await window.crawler.pullList(serviceId, auth, undefined);
  await Bluebird.map(
    res.list,
    async (item) => {
      await window.database.createItemFolder(
        libraryLocation,
        serviceId,
        auth,
        item
      );
    },
    { concurrency: 3 }
  );
};

export default {
  pullIncrementalUpdates,
};
