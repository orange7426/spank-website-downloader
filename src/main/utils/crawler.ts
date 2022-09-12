import Crawler from 'crawler';
import http from 'http';
import path from 'path';
import fs from 'fs';

export const crawler = new Crawler({
  maxConnections: 1,
  callback: (error, res, done) => {
    console.log(error, res);
    done();
  },
});

const TIMEOUT = 10000;

export const download = (
  url: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  options: Object,
  basePath: string,
  overrideFileName: string | null = null
) => {
  const start = process.hrtime();

  let basename = path.basename(url);
  if (overrideFileName) {
    basename = overrideFileName + path.extname(basename);
  }
  const pathWithFileName = path.join(basePath, basename);
  const file = fs.createWriteStream(pathWithFileName);

  return new Promise<void>((resolve, reject) => {
    const req = http.get(url, options).on('response', (res) => {
      const len = parseInt(res.headers['content-length'] ?? '0', 10);
      let downloaded = 0;
      let percent = '0';
      res
        .on('data', (chunk) => {
          file.write(chunk);
          downloaded += chunk.length;
          percent = ((100.0 * downloaded) / len).toFixed(2);
          process.stdout.write(`Downloading ${percent}% ${downloaded} bytes\r`);
        })
        .on('end', () => {
          file.end();
          const elapsed = process.hrtime(start)[1] / 1000000000;
          console.log(`${basename} downloaded. used ${elapsed.toFixed(3)}s`);
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });
    req.setTimeout(TIMEOUT, () => {
      req.abort();
      reject(new Error(`request timeout after ${TIMEOUT / 1000.0}s`));
    });
  });
};
