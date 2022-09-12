import type Crawler from 'crawler';

export default {
  id: 'bispanking',
  name: 'Bi Spanking',
  website: 'http://www.bispanking.com/',
  logo: 'http://www.bispanking.com/images/bispanking_title.jpg',
  verifyAccount: async (
    crawler: Crawler,
    username: string,
    password: string
  ) => {
    return new Promise((resolve, reject) => {
      crawler.queue({
        uri: 'http://www.bispanking.com/members/',
        auth: {
          user: username,
          pass: password,
        },
        retries: 0,
        callback: (err, res, done) => {
          resolve(err ? false : res.statusCode === 200);
          done();
        },
      });
    });
  },
};
