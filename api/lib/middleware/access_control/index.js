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

  "post": {
    "/users": ["admin"],
    "/tickets": ["member", "admin"]
  },
  "put": {
    "/users/:user": ["owner", "admin"],
    "/tickets/:ticketID": ["owner"],
    "/tickets/:ticketID/comments/:commentID": ["owner"]
  },
  "delete": {
    "/tickets/:ticketID": ["owner", "admin"]
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
      accessLevels,
      accessControl,
      routes = Routes;

  if(method === 'get') {
    // Don't worry about access control on GET request
    return next();
  }

  // routes for the method
  routes = Object.getOwnPropertyDescriptor(routes, method).value;
  
  for (var route in routes) {
    accessLevels = Object.getOwnPropertyDescriptor(routes, route).value;
    route = new Route(route);

    found = route.match(path);

    if (found) {
      route.mapKeys(found);
      accessControl = new AC(route, accessLevels);
      accessControl.resolveKeys(checkAccess);
    }
  }

  if (found === null) return next(new Error("Not Authenticated"));

  function checkAccess(err) {
    if(err) next(new Error("Not Authenticated"));

    if(accessControl.checkAccess(req.user)) {
      setReqObjects();
    } else {
      return next(new Error("Not Authenticated"));
    }
  }

  function setReqObjects() {
    var _i = 0;

    if (accessControl.keys.length === 0) done();

    for(_i = 0; _i < accessControl.keys.length; _i++) {
      var key, model;

      model = accessControl.keys[_i];
      key = model[0].replace(/[ID]/g, '');
      req[key] = model[1];
    }

    return next();
  }
};
