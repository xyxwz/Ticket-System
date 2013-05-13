{
  "baseUrl": "./",
  "name": "libs/almond",
  "include": ["jquery", "main"],
  "out": "./release/bundle.js",
  "paths": {
    "jquery":           "libs/jquery",
    "backbone":         "libs/backbone-0.9.10",
    "underscore":       "libs/lodash",
    "text":             "libs/require/text",
    "mustache":         "libs/mustache",
    "marked":           "libs/marked",
    "moment":           "libs/moment",
    "dropdowns":        "libs/plugins/bootstrap.dropdowns",
    "autoresize":       "libs/plugins/jquery.autoresize",
    "spin":             "libs/spin",
    "Mousetrap":        "libs/mousetrap",
    "EventSource":      "libs/eventsource",
    "Shortcuts":        "support/Shortcuts",
    "Sync":             "support/Sync",
    "BaseView":         "support/GarbageCollector",
    "AppView":          "support/AppView",
    "ServerEvents":     "support/ServerEvents"
  },
  "optimize": "uglify",
  "preserveLicenseComments": false,
  "findNestedDependencies": true,
  "wrap": true
}