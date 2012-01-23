"use strict";
var schemas = require('../../../models/schemas');

/**
 *  Taken and modified from the express router code by TJ
 *  https://github.com/visionmedia/express/blob/master/lib/router/route.js
 */

/**
 *  Expose `Route`.
 */

module.exports = Route;

 /**
 *  Initialize 'Route'
 *
 *  :path   - String, path from routing table
 */

function Route(path) {
  this.path = path;
  this.regexp = normalize(path, this.keys = []);
}

/**
 *  Check it this route matches 'path'
 *
 *  :path  - String, a URL to match
 *
 *  Returns captures made
 */

Route.prototype.match = function(path){
  this.captures = this.regexp.exec(path);
  return this.captures;
};

/**
 *  Match keys to params
 *
 *  Sets this.params to key values as determined in
 *  the route.
 
 *  ex: /tickets/:ticketID would return [ticket: '123'] for
 *      the url /tickets/123
 *
 *  Returns an array of mapped path values
 */

Route.prototype.mapKeys = function() {
  var keys, val, captures;

  keys = this.keys;
  captures = this.captures || [];
  this.paramKeys = [];

  // params from capture groups
  for (var j = 1, jlen = captures.length; j < jlen; ++j) {
    var key = keys[j-1];
    val = 'string' == typeof captures[j] ? decodeURIComponent(captures[j]) : captures[j];
    if (key) {
      this.paramKeys[key.name] = val;
    } else {
      this.paramKeys.push(val);
    }
  }

  return this.paramKeys;
};


/**
 *  Normalize the given path string
 *
 *  :path - String
 *  :keys - Array, keys
 *
 *  Returns a regular expression
 */

function normalize(path, keys) {
  path = path
  .concat('/?')
  .replace(/\/\(/g, '(?:/')
  .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', 'i');
}
