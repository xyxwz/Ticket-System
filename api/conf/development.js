/**
 * DEVELOPMENT Environment settings
 */
module.exports = function(app,express) {

  app.set('db-uri', 'mongodb://localhost/ticket-system-development');
  app.set('redisDB', 1);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

}