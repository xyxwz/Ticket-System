var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    lib = require('./lib');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/client');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: lib.settings.session_secret }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api', lib.Auth);
  app.use(app.router);
  app.use(express.static('../client/'));
});
  

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.db = mongoose.connect('mongodb://localhost/ticket-system-development');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.db = mongoose.connect('mongodb://127.0.0.1/ticket-system');
});

app.configure('test', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.db = mongoose.connect('mongodb://localhost/ticket-system-test');
});


// Models
app.models = require('./models');

// Controllers
app.controllers = require('./controllers')(app);


/* -------------------------------- */
/* Passport Authentication Strategy */
/* -------------------------------- */

// Passport Sessions
// Stores access token in session
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var User = mongoose.model('User');

// Use the GitHubStrategy within Passport.
passport.use(new GitHubStrategy({
    clientID: lib.settings.github_client_id,
    clientSecret: lib.settings.github_client_secret,
    callbackURL: "http://"+lib.settings.host_ip+":3000/login/oauth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var primaryEmail = profile.emails[0]['value'];
    User.setAccessToken(primaryEmail, accessToken, function(err, token) {
      if(err) return res.json({error: err}, 401);
      return done(null, token);
    });
  }
));

app.listen(3000);
