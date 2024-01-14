/* eslint-disable no-await-in-loop, no-constant-condition */
import type Crawler from 'crawler';
import moment from 'moment';
import type { Auth, ItemAbstract, ItemContent, Media } from '.';
import { request, joinUrl, escapeId, getDestination } from './utils';

const BASE = 'https://www.realspankingsinstitute.com/members/';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

export default {
  id: 'realspankinginstitute',
  name: 'Real Spanking Institute',
  website: 'https://www.realspankingsinstitute.com/',
  logo: 'http://www.realspankingsnetwork.com/images/logo_rsi.jpg',
  verifyAccount: async (crawler: Crawler, auth: Auth): Promise<boolean> =>
    request(crawler, BASE, auth, (res) => res?.statusCode === 200, false),
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
    // Step 1: Parse landing page for videos and image landing page
    const { videos, imageListUrls } = await request(
      crawler,
      itemAbstract.link,
      auth,
      (res) => {
        const internalVideos = res
          .$(
            'body > table:nth-of-type(2) > tr:last-child > td > table > tr:nth-of-type(3) > td table > tr'
          )
          .children('td')
          .map((_, child) => {
            const $child = res.$(child);
            const movieLinks = $child.find('a');
            const movieLink = movieLinks.last().attr('href');
            if (movieLink == null) return null;
            const videoUrl = joinUrl(BASE, movieLink);
            const destination = getDestination('videos', videoUrl);
            if (videoUrl == null || destination == null) {
              return null;
            }
            return {
              url: videoUrl,
              destination,
            };
          })
          .get()
          .filter((video) => video != null);

        const internalImageListUrls = res
          .$('select[name=menu1]')
          .children('option')
          .map((_, child) => {
            const $child = res.$(child);
            const imagePageLink = joinUrl(BASE, $child.attr('value'));
            return imagePageLink;
          })
          .get();

        return {
          videos: internalVideos,
          imageListUrls: internalImageListUrls,
        };
      }
    );

    // Step 2: Pull and parse for image list
    const imageViewUrls: Array<string> = [];
    await Promise.all(
      imageListUrls.map(async (imageListUrl) => {
        const currentImageViewUrls = await request(
          crawler,
          imageListUrl,
          auth,
          (res) => {
            const imageList = res
              .$(
                'body > table:nth-of-type(2) > tr:last-child > td > table > tr:nth-of-type(4) > td table'
              )
              .find('a')
              .map((_, child) => {
                const $child = res.$(child);
                return $child.attr('href');
              })
              .get()
              .filter((it) => it != null)
              .filter((href) => href.startsWith('images.php'))
              .map((href) => joinUrl(BASE, href));
            return imageList as string[];
          }
        );
        imageViewUrls.push(...currentImageViewUrls);
      })
    );

    // Step 3: Read image list and get image file link
    const photos = (
      await Promise.all(
        imageViewUrls.map((imageViewUrl) =>
          request(crawler, imageViewUrl, auth, (res) => {
            const imagePath = res
              .$(
                'body > table:nth-of-type(2) > tr:last-child > td > table > tr:last-child img'
              )
              .attr('src');
            const photoUrl = joinUrl(BASE, imagePath);
            const destination = getDestination('photos', photoUrl);
            if (photoUrl == null || destination == null) {
              return null;
            }
            return {
              url: photoUrl,
              destination,
            };
          })
        )
      )
    ).filter((photo): photo is Media => photo != null);

    return [...videos, ...photos];
  },
};
