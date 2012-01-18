var url = require('url');

/**
 * PRODUCTION Environment settings
 */
module.exports = function(app,express) {
  var redisUrl, redisAuth;

  // Redis Connection
  redisUrl = url.parse(process.env.REDISTOGO_URL);
  redisAuth = redisUrl.auth.split(':');
  app.set('redisHost', redisUrl.hostname);
  app.set('redisPort', redisUrl.port);
  app.set('redisDb', redisAuth[0]);
  app.set('redisPass', redisAuth[1]);

  // MongoDB Connection
  app.set('db-uri', process.env.MONGOLAB_URI);

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}