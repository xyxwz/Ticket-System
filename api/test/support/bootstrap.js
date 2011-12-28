var express = require('express'),
    mongoose = require('mongoose'),
    lib = require('../../lib');


process.env.NODE_ENV = "test";


function createServer(){
  var app = express.createServer();

  // Load DB Connection
  require('../../conf/configuration.js')(app,express);
  mongoose.connect(app.set('db-uri'));

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.Error);

  app.use(app.router);

  var path = '../../';
  require(path + 'controllers/helpers/pre-conditions')(app);
  require(path + 'controllers/authentication')(app);
  require(path + 'controllers/api/users')(app);
  require(path + 'controllers/api/tickets')(app);
  require(path + 'controllers/api/comments')(app);
  require(path + 'controllers/static')(app);

  return app.listen(3000);
}

exports.app = createServer;