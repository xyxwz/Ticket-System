/* ---------------------------------------------- *
 * Access Control Middleware
 * ---------------------------------------------- */

/**
 *  Access Control Middleware
 *
 *  Should be placed after any authentication middleware
 *  and requires the req object to contain req.user.
 *  The user should have some sort of role attribute that
 *  can be checked against.
 *
 */

module.exports = require('./lib/middleware');