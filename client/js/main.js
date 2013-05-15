require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/backbone-0.9.10',
    'underscore':       'libs/lodash',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'marked':           'libs/marked',
    'moment':           'libs/moment',
    'dropdowns':        'libs/plugins/bootstrap.dropdowns',
    'autoresize':       'libs/plugins/jquery.autoresize',
    'spin':             'libs/spin',
    'EventSource':      'libs/eventsource',
    'Mousetrap':        'libs/mousetrap',
    'Shortcuts':        'support/Shortcuts',
    'Sync':             'support/Sync',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
    'ServerEvents':     'support/ServerEvents'
  }
});

require(['jquery', 'underscore', 'backbone', 'BaseView'],
function($, _, Backbone, BaseView) {
  // framework is now loaded
  require(['app'], function(){ });
});
