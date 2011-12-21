var models = require('../models'),
    User = models.User,
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    settings = require('./settings');

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

// Use the GitHubStrategy within Passport.
passport.use(new GitHubStrategy({
    clientID: settings.github_client_id,
    clientSecret: settings.github_client_secret,
    callbackURL: "http://"+settings.host_ip+":3000/login/oauth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    var primaryEmail = profile.emails[0]['value'];
    User.setAccessToken(primaryEmail, accessToken, function(err, token) {
      if(err) return res.json({error: err}, 401);
      return done(null, token);
    });
  }
));