var url = require('url');

/**
 * PRODUCTION Environment settings
 */
module.exports = function(app,express) {
  var redisUrl, redisDB;

  // Redis Connection
  // ex: redis://0:@127.0.0.1:6379
  redisUrl = url.parse(process.env.REDIS_URI);
  redisDB = process.env.REDIS_DB;

  app.set('redisHost', redisUrl.hostname);
  app.set('redisPort', redisUrl.port);
  app.set('redisDb', redisDB);
  app.set('redisPass', '');

  // MongoDB Connection
  app.set('db-uri', process.env.MONGO_URI);

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
};