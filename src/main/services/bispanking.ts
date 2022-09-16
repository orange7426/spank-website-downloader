/* eslint-disable no-await-in-loop, no-constant-condition */
import type Crawler from 'crawler';
import _zipObject from 'lodash/zipObject';
import moment from 'moment';
import type { Auth, ItemAbstract, ItemContent, Media } from '.';
import { request, joinUrl, getDestination } from './utils';

const BASE = 'http://www.bispanking.com/members/';

export default {
  id: 'bispanking',
  name: 'Bi Spanking',
  website: 'http://www.bispanking.com/',
  logo: 'http://www.bispanking.com/images/bispanking_title.jpg',
  verifyAccount: async (crawler: Crawler, auth: Auth): Promise<boolean> =>
    request(crawler, BASE, auth, (res) => res?.statusCode === 200, false),
  pullList: async (
    crawler: Crawler,
    auth: Auth,
    page = 'http://www.bispanking.com/members/search.php'
  ): Promise<{
    list: Array<ItemAbstract>;
    nextPage: string | null;
  }> =>
    request(crawler, page, auth, (res) => {
      const searchResults = res.$('#searchResults');
      const sceneList = searchResults.children('.searchResultScene');
      const list = sceneList
        .map((_, scene) => {
          const $scene = res.$(scene);
          const linkPath = $scene.children('a').first().attr('href');
          const link = joinUrl(BASE, linkPath);
          const title = $scene.find('.searchTitle').text();
          const description = $scene.find('.searchDescription').text();
          const thumbnailPath = $scene
            .find('img.sceneImage')
            .first()
            .attr('src');
          const thumbnail = joinUrl(BASE, thumbnailPath);

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
    const { videos, imageListUrl } = await request(
      crawler,
      itemAbstract.link,
      auth,
      (res) => {
        const movieContainer = res.$('#movieContainer > table > tr:last-child');
        const movieLinks = movieContainer.find('a');
        const internalVideos = movieLinks
          .map((_, link) => {
            const videoUrl = joinUrl(BASE, res.$(link).attr('href'));
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

        const imageListPath = res.$('#largeSceneImage > a').attr('href');
        const internalImageListUrl = joinUrl(BASE, imageListPath);

        return {
          videos: internalVideos,
          imageListUrl: internalImageListUrl,
        };
      }
    );

    // Step 2: Pull and parse for image list
    let currentImageListUrl = imageListUrl;
    const imageViewUrls: Array<string> = [];
    while (currentImageListUrl != null) {
      const { imageViewUrls: currentImageViewUrls, nextImageListUrl } =
        await request(crawler, currentImageListUrl, auth, (res) => {
          return {
            imageViewUrls: res
              .$('.imagesImageContainer')
              .map((_, container) => {
                const imageViewPath = res
                  .$(container)
                  .children('a')
                  .first()
                  .attr('href');
                return joinUrl(BASE, imageViewPath);
              })
              .get()
              .filter((u) => u != null),
            nextImageListUrl: joinUrl(
              BASE,
              res.$('#nextPageLink > a').attr('href')
            ),
          };
        });
      imageViewUrls.push(...currentImageViewUrls);
      currentImageListUrl = nextImageListUrl;
    }

    // Step 3: Read image list and get image file link
    const photos = (
      await Promise.all(
        imageViewUrls.map((imageViewUrl) =>
          request(crawler, imageViewUrl, auth, (res) => {
            const imagePath = res
              .$('#imagesContainer')
              .next()
              .children('img')
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
