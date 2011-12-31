require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.5.3',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'jquery':           'libs/jquery-1.7.1.min',
    'mustache':         'libs/mustache',
  },
});

require(['require', 'backbone', 'jquery', 'underscore'],
function(require, Backbone, $, _) {
  // framework is now loaded
  require(['require', 'jquery', 'backbone', 'app'], function(require, $, Backbone){
    // Any config or setup can go here
    // Ideally load an jQuery plugins or attachments

    /* Override the Backbone sync functionality -
     * all calls to Backbone.sync now send an auth_token
     * header. */
    Backbone.sync_model = Backbone.sync;
    Backbone.sync = function(method, model, options) {

      var new_options = _.extend({

        beforeSend: function(xhr) {

          // Get the authentication token from the page
          var auth_token = $('meta[name="X-Auth-Token"]').attr('content');
          if (auth_token) {
            xhr.setRequestHeader('X-Auth-Token', auth_token);
          }
          // Add Accept Header for API
          xhr.setRequestHeader('Accept', 'application/json');
        }
      }, options);

      Backbone.sync_model(method, model, new_options);

    };

  });
});
