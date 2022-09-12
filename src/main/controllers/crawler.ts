import { ipcMain } from 'electron';
import _pick from 'lodash/pick';
import _mapValues from 'lodash/mapValues';
import services from '../services';
import { crawler } from '../utils/crawler';

ipcMain.handle('crawler-list-available-services', async () =>
  _mapValues(services, (service) =>
    _pick(service, ['id', 'name', 'website', 'logo'])
  )
);

ipcMain.handle(
  'crawler-verify-account',
  async (event, serviceId: string, auth: Auth) => {
    const service = services[serviceId];
    if (serviceId == null) {
      throw new Error('Service not found');
    }
    return service.verifyAccount(crawler, auth);
  }
);

ipcMain.handle(
  'crawler-pull-list',
  async (event, serviceId: string, auth: Auth, page: string | undefined) => {
    const service = services[serviceId];
    if (serviceId == null) {
      throw new Error('Service not found');
    }
    return service.pullList(crawler, auth, page);
  }
);
