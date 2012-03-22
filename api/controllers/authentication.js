var strategies = require('../lib/authentication'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    txsscStrategy = require('passport-txssc').Strategy;

module.exports = function(app) {

  /* OAuth Middleware *
   * GET /login/oauth/authorize
   *
   * Sends the user to the OAuth provider to authenticate with.
   * Afterwards will use callback specified in OAuth application (SSO) */
  app.get('/login/oauth/authorize',
    passport.authenticate('txssc'),
    function(req, res){ /* Redirected to SSO. Function is never called */});


  /* OAuth Callback *
   * GET /login/oauth/callback
   *
   * Use passport.authenticate() as route middleware to authenticate the request.
   * Currently if authentication fails redirect back to home page. */
  app.get('/login/oauth/callback',
    passport.authenticate('txssc', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/');
    });


  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

};