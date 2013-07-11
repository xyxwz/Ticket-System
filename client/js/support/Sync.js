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
      var new_options = _.extend({

        beforeSend: function(xhr) {
          if(auth_token) {
            xhr.setRequestHeader('X-Auth-Token', auth_token);
          }

          // Add Accept Header for API
          xhr.setRequestHeader('Accept', 'application/json');
        }
      }, options);

      default_sync(method, model, new_options);
    };
  };

  return SyncOverride;
});