var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
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
  passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "http://"+process.env.CALLBACK_HOST+"/login/oauth/callback"
    },
    function(token, tokenSecret, profile, done) {
      var sessionData;

      User._authorize(token, tokenSecret, profile, function(err, user) {
        sessionData = {
          id: user.id,
          token: token,
          name: user.name,
          role: user.role
        }

        if (user.avatar) sessionData.avatar = user.avatar;

        return done(null, sessionData);
      });
    }
  ));

};
