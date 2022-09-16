/* eslint-disable promise/always-return, promise/no-promise-in-callback, promise/no-callback-in-promise */
import Crawler from 'crawler';
import url from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { app } from 'electron';
import Cheerio from 'cheerio';
import moment from 'moment';

const CACHE_PATH = path.join(app.getAppPath(), 'cache');

console.log(`Cache Path: ${CACHE_PATH}`);

const hash = (original: string): string =>
  crypto.createHash('md5').update(original).digest('hex');

const readCache = async (key: string): Promise<string | null> => {
  const cachePath = path.join(CACHE_PATH, key);
  if (!fs.existsSync(cachePath)) {
    return null;
  }

  // Give up cache modified over 24 hours
  const { mtime } = await fs.promises.stat(cachePath);
  const durationHr = moment().diff(moment(mtime), 'hour');
  if (durationHr >= 24) return null;

  return fs.promises.readFile(cachePath, 'utf-8');
};

const writeCache = async (
  key: string,
  data: string | Buffer
): Promise<void> => {
  const cachePath = path.join(CACHE_PATH, key);
  if (!fs.existsSync(CACHE_PATH)) {
    await fs.promises.mkdir(CACHE_PATH, { recursive: true });
  }
  await fs.promises.writeFile(cachePath, data);
};

export interface RequestResponse {
  body: string | Buffer;
  $: cheerio.CheerioAPI;
  statusCode?: number;
}

export async function request<T>(
  crawler: Crawler,
  uri: string,
  auth: Auth,
  callback: (res: RequestResponse) => T,
  useCache = true
): Promise<T> {
  const key = hash(uri);
  if (useCache) {
    const cache = await readCache(key);
    if (cache) {
      return callback({
        body: cache,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $: Cheerio.load(cache),
      });
    }
  }

  return new Promise((resolve, reject) => {
    crawler.queue({
      uri,
      auth,
      retries: 0,
      callback: (err, res, done) => {
        if (err || res.statusCode !== 200) {
          reject(err);
          done();
          return;
        }
        if (useCache) {
          writeCache(key, res.body)
            .then(() => {
              resolve(callback(res));
              done();
            })
            .catch(() => {
              reject();
              done();
            });
        } else {
          resolve(callback(res));
          done();
        }
      },
    });
  });
}

export function joinUrl(
  base: string,
  p: string | null | undefined
): string | null {
  if (p == null || p.trim().length === 0) return null;
  return new URL(p, base).href;
}

export function getDestination(
  prefix: string,
  link: string | null | undefined
): string | null {
  if (link == null) {
    return null;
  }
  const pathname = url.parse(link)?.pathname;
  if (pathname == null) {
    return null;
  }
  return path.join(prefix, path.basename(pathname));
}

export function escapeId(id: string): string {
  return id.replace(/[\s\W]+/g, '.').replace(/\.$/g, '');
}
