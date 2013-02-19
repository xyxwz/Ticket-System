require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.9.0',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'marked':           'libs/marked',
    'moment':           'libs/moment',
    'dropdowns':        'libs/plugins/bootstrap.dropdowns',
    'autoresize':       'libs/plugins/jquery.autoresize',
    'spin':             'libs/spin',
    'EventSource':      'libs/eventsource',
    'Sync':             'support/Sync',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
    'ServerEvents':     'support/ServerEvents',
    'AppCache':         'support/AppCache'
  }
});

require(['jquery', 'underscore', 'backbone', 'BaseView'],
function($, _, Backbone, BaseView) {
  // framework is now loaded
  require(['app'], function(){ });
});
