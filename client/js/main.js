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
    'timeline':         'libs/timeline',
    'BaseView':         'support/GarbageCollector',
    'AppView':          'support/AppView',
  },
});

require(['jquery', 'underscore', 'backbone', 'BaseView'],
function($, _, Backbone, BaseView) {
  // framework is now loaded

  /* Override Backbone Model
   * return model if it already exists
   */
  Backbone.old_model = Backbone.Model;
  Backbone.Model = function(attributes, options) {
    var existing;

    existing = _.find(ticketer.models, function(_ticket) {
      return _ticket.id === attributes.id;
    });

    if (existing) {
      return existing;
    }
    else {
      var defaults;
      attributes || (attributes = {});
      if (defaults = this.defaults) {
        if (_.isFunction(defaults)) defaults = defaults.call(this);
        attributes = _.extend({}, defaults, attributes);
      }
      this.attributes = {};
      this._escapedAttributes = {};
      this.cid = _.uniqueId('c');
      this.set(attributes, {silent : true});
      this._changed =false;
      this._previousAttributes = _.clone(this.attributes);
      if (options && options.collection) this.collection = options.collection;
      this.initialize(attributes, options);
    }
  };

  _.extend(Backbone.Model.prototype, Backbone.old_model.prototype);
  Backbone.Model.extend = Backbone.old_model.extend;

  require(['app'], function(){
    // Any config or setup can go here
  });
});
