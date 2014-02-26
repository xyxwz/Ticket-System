var models = require('../../models'),
    User = models.User;

/* ---------------------------------------------- *
 * Error Handler Middleware
 * ---------------------------------------------- */

/* Error Handler Middleware *
 *
 * Returns 401 status if Not Authenticated
 * Else passes it on to the next error handler */
exports.Error = function(err, req, res, next) {
  if(err.message === "Not Authenticated") {
    res.json({ error: err.message }, 401);
  } else if(err.message === "Not Authorized") {
    res.json({ error: err.message }, 403);
  } else {
    next(err);
  }
};