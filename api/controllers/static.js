var mongoose = require('mongoose'),
    Ticket = mongoose.model('Ticket');

module.exports = function(app) {
  
  /* Site Index
   * GET /
   *
   * currently just renders the index.jade view
   */
  app.get('/', function(req, res) {
    if(req.session.passport.user) {

      /* If User session then user has been authenticated.
       * Get tickets to bootstrap into page.
       * This prevents a fetch on page load. */
      Ticket.getAll('open', function(err, models) {
        if(err) return res.json({error: 'Error getting tickets'}, 400);
        var openTickets = models;

        Ticket.getAll('closed', function(err, models) {
          if(err) return res.json({error: 'Error getting tickets'}, 400);
          var closedTickets = models;

          // Render Index with bootstrapped tickets
          res.render('index', {
            token: req.session.passport.user,
            openTickets: JSON.stringify(openTickets),
            closedTickets: JSON.stringify(closedTickets),
          });

        });
      });
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
