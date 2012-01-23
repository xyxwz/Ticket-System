"use strict";

var parse = require('url').parse,
    Route = require('./route'),
    AC = require('./access');

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


/**
 *  Routing Table
 *
 *  An object literal that gives minimum access
 *  requirements for each route
 *
 */

var Routes = {

  // Members and Admins can access all paths
  // except /users and /tickets/mine
  "get": {
    "/users": ["admin"],
    "/users/:userID": ["admin"],
    "/tickets": ["member", "admin"],
    "/tickets/mine": ["admin"],
    "/tickets/:ticketID": ["member", "admin"],
    "/tickets/:ticketID/comments": ["member", "admin"],
    "/tickets/:ticketID/comments/:commentID": ["member", "admin"]
  },

  // Only admins may create users
  "post": {
    "/users": ["admin"],
    "/tickets": ["member", "admin"],
    "/tickets/:ticketID/comments": ["member", "admin"]
  },

  // Limit updates to only the resource owner, except for
  // Users where an admin may need to make a change
  "put": {
    "/users/:userID": ["owner", "admin"],
    "/tickets/:ticketID": ["owner"],
    "/tickets/:ticketID/comments/:commentID": ["owner"]
  },

  // Only Admins or the resource owner may delete a resource
  "delete": {
    "/users/:userID": ["admin"],
    "/tickets/:ticketID": ["owner", "admin"],
    "/tickets/:ticketID/comments/:commentID": ["owner", "admin"]
  }
};

/**
 *  Access Control Middleware
 *
 *  Determines if a user may access the route.
 *
 *  Performs querys on keys included in the route and
 *  sets the req.[key] to the object.
 *
 */

exports.AccessControl = function(req, res, next) {
  var method = req.method.toLowerCase(),
      url = parse(req.url),
      path = url.pathname,
      found,
      captured,
      accessLevels,
      accessControl,
      routes = Routes;

  // routes for the method
  routes = Object.getOwnPropertyDescriptor(routes, method).value;
  
  for (var route in routes) {
    accessLevels = Object.getOwnPropertyDescriptor(routes, route).value;
    route = new Route(route);

    found = route.match(path);

    if (found) {
      captured = found;
      route.mapKeys(found);
      accessControl = new AC(route, accessLevels);
      accessControl.resolveKeys(checkAccess);
      break;
    }
  }

  if (captured === null) return next(new Error("Not Authorized"));

  function checkAccess(err) {
    if(err) next(new Error("Not Authorized"));

    if(accessControl.checkAccess(req.user)) {
      setReqObjects();
    } else {
      return next(new Error("Not Authorized"));
    }
  }

  function setReqObjects() {
    var _i = 0;

    if (accessControl.keys.length === 0) return next();

    for(_i = 0; _i < accessControl.keys.length; _i++) {
      var key, model;

      model = accessControl.keys[_i];
      key = model[0].replace(/[ID]/g, '');
      req[key] = model[1];
    }

    return next();
  }
};
