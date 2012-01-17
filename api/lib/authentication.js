var passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    settings = require('../conf/settings'),
    User;


module.exports = function(app) {

  User = require('../models')(app).User;

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
      User.setAccessToken(primaryEmail, accessToken, function(err, user) {
        if(err) return done(new Error(err));
        var sessionData = {
          id: user._id,
          token: user.access_token,
          name: user.name,
          role: user.role
        }
        return done(null, sessionData);
      });
    }
  ));

};
