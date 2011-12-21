var passport = require('passport'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    GitHubStrategy = require('passport-github').Strategy;

module.exports = function(app) {

  /* OAuth Middleware *
   * GET /login/oauth/authorize
   *
   * Sends the user to the OAuth provider to authenticate with.
   * Afterwards will use callback specified in OAuth application (Github.com) */
  app.get('/login/oauth/authorize',
    passport.authenticate('github'),
    function(req, res){ /* Redirected to Github. Function is never called */});


  /* OAuth Callback *
   * GET /login/oauth/callback
   *
   * Use passport.authenticate() as route middleware to authenticate the request. 
   * Currently if authentication fails redirect back to home page. */
  app.get('/login/oauth/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/');
    });


  app.get('/logout', function(req, res){
    if(req.session.passport.user) {
      var token = req.session.passport.user;
      User.destroyAccessToken(token, function(err, status) {
        if(err) return res.json({error: err}, 400);
        req.logout();
        res.redirect('/');
      })
    }
    else {
      res.redirect('/');
    }
  });

}