var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    lib = require('./lib');

var path = __dirname;
var app;

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
  app.set('view engine', 'jade');
  app.set('views', path + '/client');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: lib.settings.session_secret }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api', lib.middleware.Auth);
  app.use('/api', lib.middleware.Error);
  app.use(app.router);
  app.use(express.static(path + '/client/'));
}

// Bootstrap models
function bootModels(app) {
  app.models = require('./models');
  mongoose.connect(app.set('db-uri'));
}

// Bootstrap controllers
function bootControllers(app) {
  require(path + '/controllers/helpers/pre-conditions')(app);
  require(path + '/controllers/authentication')(app);
  require(path + '/controllers/api/users')(app);
  require(path + '/controllers/api/tickets')(app);
  require(path + '/controllers/api/comments')(app);
  require(path + '/controllers/static')(app);
}

// allow normal node loading if appropriate
if (!module.parent) {
  exports.boot().listen(3000);
}
