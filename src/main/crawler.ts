import { ipcMain } from 'electron';
import Crawler from 'crawler';
import _pick from 'lodash/pick';
import _mapValues from 'lodash/mapValues';
import services from './services';

const crawler = new Crawler({
  maxConnections: 3,
  callback: (error, res, done) => {
    console.log(error, res);
    done();
  },
});

ipcMain.handle('crawler-list-available-services', async () =>
  _mapValues(services, (service) =>
    _pick(service, ['id', 'name', 'website', 'logo'])
  )
);

ipcMain.handle(
  'crawler-verify-account',
  async (event, serviceId: string, username: string, password: string) => {
    const service = services[serviceId];
    if (serviceId == null) {
      throw new Error('Service not found');
    }
    return service.verifyAccount(crawler, username, password);
  }
);

ipcMain.handle(
  'crawler-pull-list',
  async (
    event,
    serviceId: string,
    username: string,
    password: string,
    page: string | undefined
  ) => {
    const service = services[serviceId];
    if (serviceId == null) {
      throw new Error('Service not found');
    }
    return service.pullList(crawler, username, password, page);
  }
);
