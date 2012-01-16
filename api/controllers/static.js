var User, Ticket;

module.exports = function(app) {

  User = app.models.User;
  Ticket = app.models.Ticket;
  
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
          myTickets: JSON.stringify(data.myTickets),
          admins: JSON.stringify(data.admins),
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
    bootstrapTickets({status: 'open'}, function(err, tickets) {
      if(err) return cb('error getting open tickets');
      data.openTickets = tickets;

      bootstrapTickets({status: 'closed'}, function(err, tickets) {
        if(err) return cb('error getting closed tickets');
        data.closedTickets = tickets;

        bootstrapAdmins(function(err, admins) {
          if(err) return cb('error getting admin users');
          data.admins = admins;
          data.currentUser = req.session.passport.user;

          bootstrapTickets({status: 'open', user: data.currentUser.id},
          function(err, tickets) {
            if(err) return cb('error getting users tickets');
            data.myTickets = tickets;
            return cb(null, data);
          });
        });
      });
    });
  };

  function bootstrapTickets(args, cb) {
    if (args.user) {
      Ticket.mine(args.user, args.status, 1, function(err, models) {
        if(err || !models) return cb('error getting users tickets');
        return cb(null, models);
      });
    }
    else {
      Ticket.all(args.status, 1, function(err, models) {
        if(err || !models) return cb('error getting open tickets');
        return cb(null, models);
      });
    }
  };

  function bootstrapAdmins(cb) {
    User.admins(function(err, models) {
      if(err) return cb('error getting admins');
      return cb(null, models);
    });
  };

};
