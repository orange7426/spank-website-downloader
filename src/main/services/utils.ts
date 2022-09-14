import Crawler from 'crawler';
import url from 'url';
import path from 'path';

export async function request<T>(
  crawler: Crawler,
  uri: string,
  auth: Auth,
  callback: (res: Crawler.CrawlerRequestResponse) => T
): Promise<T> {
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
        resolve(callback(res));
        done();
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
