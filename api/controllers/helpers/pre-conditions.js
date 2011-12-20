var mongoose = require('mongoose');
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');
var _ = require('underscore');

/* ---------------------------------------------- *
 * Pre-conditions
 * ---------------------------------------------- */

module.exports = function(app) {

  /* Find A User */
  app.param('userID', function(req, res, next, id){
    User
    .findOne({'_id':id})
    .run(function(err, user) {
      if(err || !user) return res.json({error: 'User not found'}, 404);
      req.user = user;
      next();
    });
  });


  /* Find A Ticket */
  app.param('ticketID', function(req, res, next, id){
    Ticket
    .findOne({'_id':id})
    .populate('user')
    .populate('comments.user')
    .run(function(err, model){
      if(err || !model) return res.json({error: 'Ticket not found'}, 404);
      req.ticket = model;
      next();
    });
  });

}
