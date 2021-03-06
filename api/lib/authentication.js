var passport = require('passport'),
    txsscStrategy = require('passport-txssc').Strategy,
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
  passport.use(new txsscStrategy({
    clientID: process.env.CONSUMER_KEY,
    clientSecret: process.env.CONSUMER_SECRET,
    callbackURL: "http://" + process.env.CALLBACK_HOST + "/login/oauth/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      var sessionData;

      User._authorize(accessToken, refreshToken, profile, function(err, user) {
        if(err) return done(err);

        sessionData = {
          _id: user.id,
          access_token: accessToken,
          name: user.name,
          role: user.role,
          username: user.username,
          settings: user.settings
        };

        if(user.avatar) sessionData.avatar = user.avatar;

        return done(null, sessionData);
      });
    }
  ));

};
