/**
 * CORS middleware
 *
 * Allows request to make cross-origin API requests
 */

exports.Cors = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  next();
};