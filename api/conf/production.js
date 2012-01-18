/**
 * PRODUCTION Environment settings
 */
module.exports = function(app,express) {

  app.set('db-uri', process.env.MONGOLAB_URI);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

}