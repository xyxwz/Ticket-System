var express = require('express'),
    mongoose = require('mongoose'),
    url = require('url'),
    redis = require('redis'),
    passport = require('passport');

var path = __dirname, lib, app, port;

/* Initial Bootstrap */
exports.boot = function(params){
  app = express.createServer();
  require(path + '/conf/configuration')(app,express);

  // Bootstrap application
  bootApplication(app);
  bootModels(app);
  bootControllers(app);
  return app;
};

function bootApplication(app) {
  lib = require('./lib')(app);

  app.set('view engine', 'jade');
  app.set('views', path + '/client');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: process.env.SESSION_SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.Error);
  app.use(app.router);
  app.use(express.static(path + '/../client/'));
}

// Bootstrap models
function bootModels(app) {
  var rtg;

  mongoose.connect(app.set('db-uri'));

  if (process.env.REDISTOGO_URL) {
    rtg = url.parse(process.env.REDISTOGO_URL);
    app.redis = redis.createClient(rtg.port, rtg.hostname);
    app.redis.auth(rtg.auth.split(":")[1]);
  } else {
    app.redis = redis.createClient();
    app.redis.select(app.set('redisDB'));
  }

  app.models = require('./models')(app);
}

// Bootstrap controllers
function bootControllers(app) {
  app.controllers = require('./controllers')(app);
}

// allow normal node loading if appropriate
if (!module.parent) {
  port = process.env.PORT || 3000;
  exports.boot().listen(port);
}
