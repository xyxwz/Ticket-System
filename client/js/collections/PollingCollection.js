define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var PollingCollection;

  /**
   * PollingCollection, used to hold a collection of generic models
   * populated from `this.url` every 5 minutes
   *
   * @param {String} url
   */

  PollingCollection = Backbone.Collection.extend({
    initialize: function(models, options) {
      options = options || {};

      this.interval = options.interval || 300000;
      this.url = options.url || '/api/notifications';

      this.poll();
    },

    /**
     * Call `this.fetch` every 5 minutes
     */

    poll: function() {
      this.fetch();
      setTimeout(this.poll.bind(this), this.interval);
    },

    /**
     * Override `Collection.fetch` for a neat callback
     */

    fetch: function(callback) {
      Backbone.Collection.prototype.fetch.call(this, {
        update: true,
        success: callback
      });
    }
  });

  return PollingCollection;
});
