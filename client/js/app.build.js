({
  appDir: "./",
  baseUrl: "./",
  dir: "./release",
  paths: {
    'jquery':           'empty:',
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
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
    'SocketEvents':     'support/SocketEvents',
    'socket.io':        'empty:'
  },
  optimize: "uglify",
  findNestedDependencies: true,
  modules: [
    {
      name: "main"
    }
  ]
})