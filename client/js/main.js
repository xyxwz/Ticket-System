require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.5.3',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'marked':           'libs/marked',
    'timeago':          'libs/plugins/jquery.timeago',
    'truncate':         'libs/plugins/jquery.truncator',
    'outsideEvents':    'libs/plugins/jquery.ba-outside-events.min',
    'jqueryui':         'libs/jqueryui-1.8.16',
    'timeline':         'libs/timeline',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
  },
});

require(['jquery', 'underscore', 'backbone', 'BaseView'],
function($, _, Backbone, BaseView) {
  // framework is now loaded
  require(['app'], function(){
    // Any config or setup can go here
  });
});
