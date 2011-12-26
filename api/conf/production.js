/**
 * PRODUCTION Environment settings
 */
module.exports = function(app,express) {

  app.set('db-uri', 'mongodb://127.0.0.1/ticket-system');        
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

}