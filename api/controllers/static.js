module.exports = function(app) {
  
  /* Site Index
   * GET /
   *
   * currently just renders the index.jade view
   */
  app.get('/', function(req, res) {
    if(req.session.passport.user) {
      // If User session then user has been authenticated.
      res.render('index');
    }
    else {
      /* If no session the user is not authenticated
       * redirect to login page to allow oAuth authentication.
       * TODO: Add error message on unsuccessfull authentication */
      res.redirect('/login');
    }
  });

  app.get('/login', function(req, res) {
    res.render('login');
  });

};
