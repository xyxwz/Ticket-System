var mongoose = require('mongoose'),
    _ = require('underscore'),
    Ticket = mongoose.model('Ticket'),
    User = mongoose.model('User');

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
      bootstrapModels(req, function(err, data) {
        if(err) res.redirect('login');

        // Render Index with bootstrapped tickets
        res.render('index', {
          token: req.session.passport.user.token,
          openTickets: JSON.stringify(data.openTickets),
          closedTickets: JSON.stringify(data.closedTickets),
          users: JSON.stringify(data.users),
          currentUser: JSON.stringify(data.currentUser),
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

  function bootstrapModels(req, cb) {
    var data = {};
    // Get Open Tickets
    Ticket.getAll('open', 1, function(err, models) {
      if(err || !models) return cb('error getting open tickets');
      data.openTickets = models;

      // Get Closed Tickets
      Ticket.getAll('closed', 1, function(err, models) {
        if(err || !models) return cb('error getting closed tickets');
        data.closedTickets = models;

        // Get Users
        User.getAll(function(err, models) {
          if(err || !models) return cb('error getting users');
          data.users = models;

          // Find Current User in Users Array
          _.find(data.users, function(user) {
            if(user.id == req.session.passport.user.id)
              data.currentUser = user;
          });

          return cb(null, data);
        });
      });
    });
  };

};