"use strict";

/**
 *  Expose `AccessControl`.
 */

 module.exports = Access;

 /**
 *  Initialize 'Access' with an instance of route
 *  and the access levels for the route from the
 *  routing table.
 *
 *  :route        - Object, instance of `Route`
 *  :accessLevels - Array, access array from routing table
 */

function Access(route, accessLevels) {
  this.route = route;
  this.accessLevels = accessLevels;
  this.params = {};
  this._params = [];
  this.keys = [];
  require('../params')(this);
}


/**
 *  Check if user is able to access path
 *
 *  Access levels options are: "admin", "member", "owner"
 *
 *  The "owner" level access control is different in that we must
 *  check the resource's owner to determine if the current user
 *  is the object's owner.
 *
 *  :user  -  a user that has been authenticated
 *            must contain a role property
 *
 *  Returns True/False
 */

Access.prototype.checkAccess = function(user) {
  var accessModel, status, self;
  
  self = this;
  status = false;

  for (var level in this.accessLevels) {
    if (this.accessLevels[level] != "owner") {
      status = this.accessLevels[level] === user.role ? true : false;
    }
    else {
      // Only Check Access for the last model in the
      // path since this is the resource being requested.
      accessModel = self.keys[self.keys.length-1][1];

      if(!accessModel) { status = false; break;}

      // check the accessModel's user.id
      if(accessModel.user) {
        status = user.id.toString() === accessModel.user._id.toString() ? true : false;
      }
      else {
        // It's the User model so just check the _id property
        status = user.id.toString() === accessModel._id.toString() ? true : false;
      }
    }

    if (status === true) { break; }
  }

  return status;
};

/**
 * A hook into class from the params file.
 *
 * Calls this.registerParam for each param function
 * in the params file. Used to attach functions to
 * params in a route.
 *
 * Returns `this` for chaining
 */

Access.prototype.param = function(name, fn){
  var self = this,
      fns = [].slice.call(arguments, 1);

  // array
  if (Array.isArray(name)) {
    name.forEach(function(name){
      fns.forEach(function(fn){
        self.param(name, fn);
      });
    });
  // param logic
  } else if ('function' == typeof name) {
    this.registerParam(name);
  // single
  } else {
    if (':' == name[0]) name = name.substr(1);
    fns.forEach(function(fn){
      self.registerParam(name, fn);
    });
  }

  return this;
};

/**
 * Register a param callback `fn` for the given `name`.
 *
 * :name - String|Function
 * :fn   - Function
 *
 * Returns `this` for chaining
 */

Access.prototype.registerParam = function(name, fn){
  // param logic
  if ('function' == typeof name) {
    this._params.push(name);
    return;
  }

  // apply param functions
  var params = this._params,
      len = params.length,
      ret;

  for (var i = 0; i < len; ++i) {
    if (ret = params[i](name, fn)) {
      fn = ret;
    }
  }

  // ensure we end up with a
  // middleware function
  if ('function' != typeof fn) {
    throw new Error('invalid param() call for ' + name + ', got ' + fn);
  }

  (this.params[name] = this.params[name] || []).push(fn);
  return this;
};

/**
 * Set Keys
 *
 * Used as a callback function within resolveKeys.
 * Sets the prototype keys property to the model
 * found in resolveKeys.
 *
 * Returns callback function when key length is equal
 */

Access.prototype.setKeys = function(key, model, cb) {
  this.keys.push([key, model]);
  
  if (this.keys.length === this.route.keys.length) {
    return cb(null);
  }
};

/**
 *  Resolve Keys
 *
 *  In order to check access on paths with keys
 *  we must look them up to obtain the owner.
 *
 *  We look up all keys even if the access level is not
 *  owner so that the route has access to the objects.
 *
 */
Access.prototype.resolveKeys = function(cb) {
  var localParams = this.params,
      self = this;

  (function pass(i, err){
    var paramCallbacks,
        paramIndex = 0,
        paramVal,
        reqParams,
        route,
        keys,
        key,
        ret;

    reqParams = self.route.paramKeys;
    keys = self.route.keys;
    i = 0;

    if(keys.length === 0) emptyKeysCallback();

    // param callbacks
    function param(err) {
      paramIndex = 0;
      key = keys[i++];
      paramVal = key && reqParams[key.name];
      paramCallbacks = key && localParams[key.name];
      try {
        if (paramCallbacks && undefined !== paramVal) {
          paramCallback();
        } else if (key) {
          param();
        }
      } catch (err) {
        param(err);
      }
    }

    param(err);

    // single param callbacks
    function paramCallback(err) {
      var fn = paramCallbacks[paramIndex++];
      if (err || !fn) return param(err);
      fn(paramVal, key.name, self.keys, keyLookupCallback);
    }

    function keyLookupCallback(err, key, model) {
      if (err) return cb(err);
      self.setKeys(key, model, cb);
      param(err);
    }

    function emptyKeysCallback() {
      cb(null);
    }

  })(0);

};
