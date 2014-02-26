var express = require('express'),
    mongoose = require('mongoose'),
    RedisStore = require('connect-redis')(express),
    url = require('url'),
    redis = require('redis'),
    passport = require('passport'),
    Emitter = require('node-redis-events');

var path = __dirname, lib, app, port;

/* Initial Bootstrap */
exports.boot = function(params){
  app = express();
  require(path + '/conf/configuration')(app,express);

  // Bootstrap application
  bootApplication(app);
  bootModels(app);
  bootControllers(app);
  sourceEvents(app);
  return app;
};

function bootApplication(app) {
  lib = require('./lib')(app);

  app.sessionStore = new RedisStore({
    host: app.set('redisHost'),
    port: app.set('redisPort'),
    db: app.set('redisDb'),
    pass: app.set('redisPass')
  });

  app.set('view engine', 'jade');
  app.set('views', path + '/client');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    cookie: { path: '/', httpOnly: true, maxAge: null},
    secret: process.env.SESSION_SECRET,
    key: 'express.sid',
    store: app.sessionStore
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/events', lib.middleware.SSE);
  app.use('/api', lib.middleware.CORS); // Allow CORS
  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.AccessControl);
  app.use(lib.middleware.Error);
  app.use(app.router);
  app.use(express.static(path + '/../client/'));
}

// Bootstrap models
function bootModels(app) {
  mongoose.connect(app.set('db-uri'));

  if (process.env.NODE_ENV === 'production') {
    app.redis = redis.createClient(app.set('redisPort'), app.set('redisHost'));
    app.redis.auth(app.set('redisPass'));
  } else {
    app.redis = redis.createClient();
    app.redis.select(app.set('redisDB'));
  }

  // Create a new global events emitter
  app.eventEmitter = new Emitter({
    redis: app.redis,
    namespace: 'tickets'
  });

  app.models = require('./models')(app);
}

// Bootstrap controllers
function bootControllers(app) {
  app.controllers = require('./controllers')(app);
}

// Include Server Sent Event Bindings
function sourceEvents(app) {
  app.sse = require('./events')(app);
}

// allow normal node loading if appropriate
if (!module.parent) {
  port = process.env.TIX_PORT || 3000;
  exports.boot().listen(port);
}
