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
  var json;

  if(err.message === "Not Authenticated") {
    json = JSON.stringify({ error: err.message });
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(json);
  }
  else if(err.message === "Not Authorized") {
    json = JSON.stringify({ error: err.message });
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(json);
  }
  else {
    next(err);
  }
};