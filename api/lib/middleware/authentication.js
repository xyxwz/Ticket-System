var models = require('../../models'),
    User = models.User;

/* ---------------------------------------------- *
 * Authentication Middleware
 * ---------------------------------------------- */

/* Authentication Middleware *
 *
 * Checks the value of the given X-Auth-Token header
 * compared to the value in the database for a user */
exports.Authenticate = function(req, res, next) {
  if(typeof(req.header('X-Auth-Token')) != 'undefined') {
    var token = req.header('X-Auth-Token');
    User
    .findOne({'access_token':token})
    .run(function(err, model){
      if(err || !model) {
        next(new Error("Not Authenticated"));
      }
      else {
        req.user = model;
        next();
      }
    });
  }
  else {
    next(new Error("Not Authenticated"));
  }
}