var globalApp,
    express = require('express'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    events = require('events').EventEmitter;

process.env.NODE_ENV = "test";


function createServer(){
  var app = express.createServer(),
      lib = require('../../lib')(app);

  // Load DB Connection
  require('../../conf/configuration.js')(app,express);
  mongoose.connect(app.set('db-uri'));
  app.redis = redis.createClient();
  app.redis.select(app.set('redisDB'));

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.Error);
  app.use('/api', lib.middleware.AccessControl);

  app.use(app.router);

  // Create a new global events emitter
  app.eventEmitter = new events();

  app.models = require('../../models')(app);
  app.controllers = require('../../controllers')(app);

  return app.listen(3000);
}

function getApp() {
  globalApp = globalApp || createServer();

  return globalApp;
}

exports.app = getApp;