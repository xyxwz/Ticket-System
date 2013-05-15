/* Override Backbone Sync Method
 * includes an X-Auth-Token and Accept Header
 */

define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

  var SyncOverride = function() {
    Backbone.sync_model = Backbone.sync;
    Backbone.sync = function(method, model, options) {

      var new_options = _.extend({

        beforeSend: function(xhr) {
          var auth_token = ticketer.currentUser.access_token;
          if (auth_token) {
            xhr.setRequestHeader('X-Auth-Token', auth_token);
          }
          // Add Accept Header for API
          xhr.setRequestHeader('Accept', 'application/json');
        }
      }, options);

      Backbone.sync_model(method, model, new_options);
    };
  };

  return SyncOverride;
});