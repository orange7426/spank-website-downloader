/* eslint-disable no-await-in-loop, no-constant-condition */
import type Crawler from 'crawler';
import moment from 'moment';
import type { Auth, ItemAbstract, ItemContent } from '.';
import { request, joinUrl, escapeId } from './utils';

const BASE = 'https://www.realspankingsinstitute.com/members/';

export default {
  id: 'realspankinginstitute',
  name: 'Real Spanking Institute',
  website: 'https://www.realspankingsinstitute.com/',
  logo: 'http://www.realspankingsnetwork.com/images/logo_rsi.jpg',
  verifyAccount: async (crawler: Crawler, auth: Auth): Promise<boolean> =>
    request(crawler, BASE, auth, (res) => res?.statusCode === 200),
  pullList: async (
    crawler: Crawler,
    auth: Auth,
    page = 'http://www.realspankingsinstitute.com/members/search.php'
  ): Promise<{
    list: Array<ItemAbstract>;
    nextPage: string | null;
  }> =>
    request(crawler, page, auth, (res) => {
      const sceneList = res.$(
        'body > table:nth-of-type(2) > tr:last-child > td > table > tr:last-child > td > table:nth-of-type(1) > tr'
      );
      const list = sceneList
        .map((_, scene) => {
          const $scene = res.$(scene);
          const mainTd = $scene.find('td:nth-of-type(2)');

          const linkPath = mainTd.find('.scene_title > a').attr('href');
          const link = joinUrl(BASE, linkPath);
          const title = mainTd.children('.scene_title').text();
          const thumbnailPath = $scene
            .find('td:nth-of-type(1) > img')
            .attr('src');
          const thumbnail = joinUrl(BASE, thumbnailPath);
          const description = mainTd
            .text()
            .split('\r\n')
            .filter((line) => {
              const trimmed = line.trim();
              return trimmed.length > 0 && trimmed !== title;
            })
            .map((line) => line.trim())
            .join('\r\n');

          const attrLines = $scene
            .find('td:nth-of-type(3)')
            .text()
            .split('\r\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
          const dateString = attrLines
            .find((line) => line.startsWith('Updated:'))
            ?.split(':')?.[1]
            ?.trim();
          const date =
            dateString == null
              ? null
              : moment(dateString, 'MMM. DD, YYYY').format('YYYYMMDD');

          const id = escapeId(`${date}.${title}`);

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

      const nextPagePath = res
        .$(
          'body > table:nth-of-type(2) > tr:last-child > td > table > tr:last-child > td > table:nth-of-type(2) > tr > td:last-child > a'
        )
        .attr('href');
      const nextPage = joinUrl(BASE, nextPagePath);

      return {
        list,
        nextPage,
      };
    }),
  pullItemContent: async (
    crawler: Crawler,
    auth: Auth,
    itemAbstract: ItemAbstract
  ): Promise<ItemContent> => {
    return [];
  },
};
