var passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    settings = require('../conf/settings'),
    User;


module.exports = function(app) {

  User = require('../models/User')(app);

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
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "http://"+process.env.HOST_IP+"/login/oauth/callback"
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