var schemas = require("../../models/schemas"),
    User = schemas.User;

/* ---------------------------------------------- *
 * SSE Authentication Middleware
 * ---------------------------------------------- */

/* SSE Authentication Middleware *
 *
 * Checks if the Passport deserialization has run and set
 * the req.user object, showing the session is set.
 */
exports.SSE = function(req, res, next) {
  // Don't Authenticate on OPTIONS requests
  if(req.method === 'OPTIONS') return next();

  if(!req.user)
    return next(new Error("Not Authenticated"));

  next();
};