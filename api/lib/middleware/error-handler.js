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
    var json = JSON.stringify({ error: err.message });
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(json);  
  }
  else {
    next(err);
  }
}