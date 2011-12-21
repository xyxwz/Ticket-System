module.exports = function(app) {
  
  /* Site Index
   * GET /
   *
   * currently just renders the index.jade view
   */
  app.get('/', function(req, res) {
    if(req.session.passport.user) {
      res.render('index', {token: req.session.passport.user});
    }
    else {
      res.redirect('/login'); 
    }
  });

  app.get('/login', function(req, res) {
    res.render('login');
  });

};
