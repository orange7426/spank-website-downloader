import type Crawler from 'crawler';
import _zipObject from 'lodash/zipObject';
import moment from 'moment';
import type { Auth, Item } from '.';

const base = 'http://www.bispanking.com/members/';

export default {
  id: 'bispanking',
  name: 'Bi Spanking',
  website: 'http://www.bispanking.com/',
  logo: 'http://www.bispanking.com/images/bispanking_title.jpg',
  verifyAccount: async (crawler: Crawler, auth: Auth) => {
    return new Promise((resolve) => {
      crawler.queue({
        uri: base,
        auth,
        retries: 0,
        callback: (err, res, done) => {
          resolve(err ? false : res.statusCode === 200);
          done();
        },
      });
    });
  },
  pullList: async (
    crawler: Crawler,
    auth: Auth,
    page = 'http://www.bispanking.com/members/search.php'
  ): Promise<{
    list: Array<Item>;
    nextPage: string | null;
  }> => {
    return new Promise((resolve, reject) => {
      crawler.queue({
        uri: page,
        auth,
        retries: 0,
        callback: (err, res, done) => {
          if (err || res.statusCode !== 200) {
            reject(err);
            done();
            return;
          }
          const searchResults = res.$('#searchResults');
          const sceneList = searchResults.children('.searchResultScene');
          const list = sceneList
            .map((_, scene) => {
              const $scene = res.$(scene);
              const linkPath = $scene.children('a').first().attr('href');
              const link =
                linkPath == null ? null : new URL(linkPath, base).href;
              const title = $scene.find('.searchTitle').text();
              const description = $scene.find('.searchDescription').text();
              const thumbnailPath = $scene
                .find('img.sceneImage')
                .first()
                .attr('src');
              const thumbnail =
                thumbnailPath == null
                  ? null
                  : new URL(thumbnailPath, base).href;

              const header = $scene
                .find('.searchTextHeader')
                .map((_1, element) => res.$(element).text())
                .get();
              const value = $scene
                .find('.searchTextHeaderVal')
                .map((_1, element) => res.$(element).text())
                .get();
              const metadata = _zipObject(header, value);

              const dateString: string | null = metadata['Updated:'];
              const date =
                dateString == null
                  ? null
                  : moment(dateString, 'MMM. DD, YYYY').format('YYYYMMDD');

              const id = `${date}.${title
                .replace(/[\s\W]+/g, '.')
                .replace(/\.$/g, '')}`;

              return {
                id,
                date,
                title,
                thumbnail,
                description,
                link,
              };
            })
            .get();

          const nextPagePath = searchResults
            .find('#pagination span')
            .first()
            .next()
            .attr('href');
          const nextPage =
            nextPagePath == null ? null : new URL(nextPagePath, base).href;

          resolve({
            list,
            nextPage,
          });
          done();
        },
      });
    });
  },
};
