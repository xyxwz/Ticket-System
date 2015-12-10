define([
  'underscore',
  'backbone',
  'models/Template'
], function(_, Backbone, Template) {
  var Templates;

  /**
   * Template collection
   */

  Templates = Backbone.Collection.extend({
    model: Template,

    initialize: function(models, options) {
      var noop = function() { return true; };

      options = options || {};

      this.url = options.url || '/api/templates';
      this.data = options.data || {};
      this.collectionFilter = options.collectionFilter || noop;
    },

    /**
     * Keep only the bare attributes we want to store in lists
     *
     * @param {Object} response
     */

    parse: function(response) {
      return response.map(function(model) {
        return {
          id: model.id,
          title: model.title,
          description: model.description
        };
      });
    },

    /**
     * Reset the collection and clear all global event bindings
     */

    destroy: function() {
      this.reset();
      ticketer.EventEmitter.off(null, null, this);
      return null;
    },

    /**
     * Add a new template to the collection
     *
     * @param {Object} data
     */

    newTemplate: function(data) {
      if(data.status === this.data.status && this.collectionFilter(data)) {
        this.add(data);
      }
    },

    /**
     * Remove the template with id `template` if in this collection
     *
     * @param {String} template
     */

    removeTemplate: function(template) {
      this.remove(template);
    }
  });

  return Templates;
});
