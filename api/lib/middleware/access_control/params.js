var schemas = require('../../../models/schemas');

/* ---------------------------------------------- *
 * Pre-conditions
 * ---------------------------------------------- */

module.exports = function(route) {

  /* Find A User */
  route.param('userID', function(id, key, cb){
    schemas.User
    .findOne({'_id':id})
    .run(function(err, model) {
      if(err || !model) return cb(err);
      cb(null, model);
    });
  });


  /* Find A Ticket */
  route.param('ticketID', function(id, key, cb){
    schemas.Ticket
    .findOne({'_id':id})
    .populate('user')
    .populate('comments.user')
    .run(function(err, model){
      if(err || !model) return cb(err);
      return cb(null, key, model);
    });
  });

};
