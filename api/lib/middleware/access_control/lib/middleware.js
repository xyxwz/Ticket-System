"use strict";

var parse = require('url').parse,
    Paths = require('../paths.js'),
    Route = require('./route'),
    AC = require('./access');

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
      routes = Paths;

  // Allow OPTIONS requests for CORS
  if(method === 'options') return next();

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
