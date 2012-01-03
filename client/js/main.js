require.config( {
  baseUrl:'js',
  paths: {
    'backbone':         'libs/AMDbackbone-0.5.3',
    'underscore':       'libs/underscore',
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'timeago':          'libs/jquery.timeago',
    'garbage':          'support/GarbageCollector',
    'AppView':          'support/AppView',
  },
});

require(['jquery', 'underscore', 'backbone', 'garbage'],
function($, _, Backbone, GarbageCollector) {
  // framework is now loaded
  require(['app'], function(){
    // Any config or setup can go here
  });
});
