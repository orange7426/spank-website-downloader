import type Crawler from 'crawler';
import type { Auth, ItemAbstract, ItemContent } from '.';

export default {
  id: 'realspankinginstitute',
  name: 'Real Spanking Institute',
  website: 'https://www.realspankingsinstitute.com/',
  logo: 'http://www.realspankingsnetwork.com/images/logo_rsi.jpg',
  verifyAccount: async (crawler: Crawler, auth: Auth): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      crawler.queue({
        uri: 'https://www.realspankingsinstitute.com/members/index.php',
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
    list: Array<ItemAbstract>;
    nextPage: string | null;
  }> => {
    return {
      list: [],
      nextPage: null,
    };
  },
  pullItemContent: async (
    crawler: Crawler,
    auth: Auth,
    itemAbstract: ItemAbstract
  ): Promise<ItemContent> => {
    return [];
  },
};
