import type Crawler from 'crawler';

export default {
  id: 'realspankinginstitute',
  name: 'Real Spanking Institute',
  website: 'https://www.realspankingsinstitute.com/',
  logo: 'http://www.realspankingsnetwork.com/images/logo_rsi.jpg',
  verifyAccount: async (
    crawler: Crawler,
    username: string,
    password: string
  ) => {
    return new Promise((resolve, reject) => {
      crawler.queue({
        uri: 'https://www.realspankingsinstitute.com/members/index.php',
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
