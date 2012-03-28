var url = require('url');

/**
 * PRODUCTION Environment settings
 */
module.exports = function(app,express) {
  var redisUrl, redisAuth;

  // Redis Connection
  // ex: redis://0:@127.0.0.1:6379
  redisUrl = url.parse(process.env.REDIS_URI);
  redisAuth = redisUrl.auth.split(':');
  app.set('redisHost', redisUrl.hostname);
  app.set('redisPort', redisUrl.port);
  app.set('redisDb', redisAuth[0]);
  app.set('redisPass', redisAuth[1]);

  // Redis Connection
  app.set('redisHost', '127.0.0.1');
  app.set('redisPort', 6379);
  app.set('redisDb', 1);
  app.set('redisPass', '');

  // MongoDB Connection
  app.set('db-uri', process.env.MONGO_URI);

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
};