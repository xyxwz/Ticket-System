require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.9.0',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'marked':           'libs/marked',
    'timeago':          'libs/plugins/jquery.timeago',
    'truncate':         'libs/plugins/jquery.truncator',
    'outsideEvents':    'libs/plugins/jquery.ba-outside-events.min',
    'autoresize':       'libs/plugins/jquery.autoresize',
    'jqueryui':         'libs/jqueryui-1.8.16',
    'timeline':         'libs/timeline',
    'Sync':             'support/Sync',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
    'SocketEvents':     'support/SocketEvents',
    'AppCache':         'support/AppCache',
    'socket.io':        '/socket.io/socket.io'
  }
});

require(['jquery', 'underscore', 'backbone', 'BaseView'],
function($, _, Backbone, BaseView) {
  // framework is now loaded
  require(['app'], function(){
    // Any config or setup can go here
  });
});
