var express = require('express'),
    mongoose = require('mongoose'),
    RedisStore = require('connect-redis')(express),
    url = require('url'),
    redis = require('redis'),
    io = require('socket.io'),
    passport = require('passport'),
    events = require('events').EventEmitter,
    pubEvents = require('node-redis-events').Publisher;

var path = __dirname, lib, app, port;

/* Initial Bootstrap */
exports.boot = function(params){
  app = express.createServer();
  require(path + '/conf/configuration')(app,express);

  // Bootstrap application
  bootApplication(app);
  bootModels(app);
  bootEventPublisher(app);
  bootControllers(app);
  socketBindings(app);
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
  app.use('/api', lib.middleware.CORS); // Allow CORS
  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.Error);
  app.use('/api', lib.middleware.AccessControl);
  app.use(app.router);
  app.use(express.static(path + '/../client/'));

  // Create a new global events emitter
  app.eventEmitter = new events();
}

// Bootstrap models
function bootModels(app) {
  var rtg;

  mongoose.connect(app.set('db-uri'));

  if (process.env.NODE_ENV === 'production') {
    app.redis = redis.createClient(app.set('redisPort'), app.set('redisHost'));
    app.redis.auth(app.set('redisPass'));
  } else {
    app.redis = redis.createClient();
    app.redis.select(app.set('redisDB'));
  }

  app.models = require('./models')(app);
}

// Bootstrap event publisher
function bootEventPublisher(app) {
  var model_events, config, eventPublisher;

  model_events = [
    'ticket:new',
    'ticket:update',
    'ticket:remove',
    'comment:new',
    'comment:update',
    'comment:remove'
  ];

  config = {
    redis: app.redis,
    emitter: app.eventEmitter,
    namespace: 'tickets'
  };

  eventPublisher = new pubEvents(config, model_events);
}

// Bootstrap controllers
function bootControllers(app) {
  app.controllers = require('./controllers')(app);
}

// Include Socket.io Bindings
function socketBindings(app) {
  app.socket = io.listen(app);
  app.socket.enable('browser client minification');
  app.socket.enable('browser client etag');
  app.socket.enable('browser client gzip');
  app.socket.set('log level', 1);
  app.socket.set('transports', [
    'websocket',
    'xhr-polling'
  ]);

  app.socketBindings = require('./sockets')(app);
}

// allow normal node loading if appropriate
if (!module.parent) {
  port = process.env.TIX_PORT || 3000;
  exports.boot().listen(port);
}
