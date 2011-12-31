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
      // Get open tickets to bootstrap into page.
      // This prevents a fetch on page load.
      Ticket.getAll('open', function(err, tickets){
        if(err) return res.json({error: 'Error getting tickets'}, 400);
        res.render('index', {
          token: req.session.passport.user,
          tickets: JSON.stringify(tickets),
        });
      });
    }
    else {
      res.redirect('/login'); 
    }
  });

  app.get('/login', function(req, res) {
    res.render('login');
  });

};
