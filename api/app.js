var express = require('express'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

var path = __dirname, lib, app;

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
  mongoose.connect(app.set('db-uri'));
  app.redis = redis.createClient();
  app.redis.select(app.set('redisDB'));

  app.models = require('./models')(app);
}

// Bootstrap controllers
function bootControllers(app) {
  app.controllers = require('./controllers')(app);
}

// allow normal node loading if appropriate
if (!module.parent) {
  exports.boot().listen(3000);
}
