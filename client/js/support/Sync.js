/* Override Backbone Sync Method
 * includes an X-Auth-Token and Accept Header
 */

define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

  /**
   * Create a closure for auth_token.
   * Important to note, this should be invoked prior to turning
   * `ticketer.currentUser` into an instance of `models/User`.
   */

  var SyncOverride = function() {
    var auth_token = ticketer.currentUser.access_token,
        default_sync = Backbone.sync;

    // Delete the access token global reference
    delete ticketer.currentUser.access_token;

    Backbone.sync = function(method, model, options) {
      var error = options.error;
      var new_options = _.extend(options, {

        beforeSend: function(xhr) {
          if(auth_token) {
            xhr.setRequestHeader('X-Auth-Token', "abc123");
          }

          // Add Accept Header for API
          xhr.setRequestHeader('Accept', 'application/json');
        },

        error: function(xhr) {
          if(xhr.status === 401) {
            return window.location.replace(window.location.origin);
          }

          return error.apply(this, arguments);
        }
      });

      default_sync(method, model, new_options);
    };
  };

  return SyncOverride;
});