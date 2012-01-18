/**
 * DEVELOPMENT Environment settings
 */
module.exports = function(app,express) {

  // Redis Connection
  app.set('redisHost', '127.0.0.1');
  app.set('redisPort', 6379);
  app.set('redisDb', 1);
  app.set('redisPass', '');

  // MongoDB Connection
  app.set('db-uri', 'mongodb://localhost/ticket-system-development');

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

}