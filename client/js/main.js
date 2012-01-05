require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.5.3',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'timeago':          'libs/jquery.timeago',
    'outsideEvents':    'libs/jquery.ba-outside-events.min',
    'jqueryui':         'libs/jqueryui-1.8.16',
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
