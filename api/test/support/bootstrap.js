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

  app.controllers = require('../../controllers')(app);

  return app.listen(3000);
}

exports.app = createServer;