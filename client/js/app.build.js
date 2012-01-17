({
  appDir: "./",
  baseUrl: "./",
  dir: "./release",
  paths: {
    'jquery': 'empty:',
    'backbone':         'libs/AMDbackbone-0.5.3',
    'underscore':       'libs/underscore',
    'marked':           'libs/marked', 
    'text':             'libs/require/text',
    'mustache':         'libs/mustache',
    'timeago':          'libs/jquery.timeago',
    'outsideEvents':    'libs/jquery.ba-outside-events.min',
    'jqueryui':         'libs/jqueryui-1.8.16',
    'timeline':         'libs/timeline',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
  },
  optimize: "uglify",
  findNestedDependencies: true,
  modules: [
    {
      name: "main",
    }
  ]
})