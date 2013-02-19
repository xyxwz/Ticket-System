/**
 * Collection dependencies
 */

define(['underscore', 'backbone', 'models/Comment'], function(_, Backbone, Comment) {

  /**
   * Comment collection, used to hold a collection of comments for
   * ticket with id `ticketId`
   *
   * @param {String} ticketId
   */

  var Comments = Backbone.Collection.extend({
    model: Comment,

    initialize: function(models, options) {
      options = options || {};

      // Set url for this comment collection
      this.url = '/api/tickets/' + options.ticketId + '/comments';

      this.comparator = function(model) {
        var date = new Date(model.get("created_at"));
        return date.getTime();
      };

      // Global event bindings
      ticketer.EventEmitter.on('comment:new', this.addComment, this);
      ticketer.EventEmitter.on('comment:update', this.updateComment, this);
      ticketer.EventEmitter.on('comment:remove', this.removeComment, this);
    },

    /**
     * Override `Collection.fetch` for a neat callback
     */

    fetch: function(callback) {
      Backbone.Collection.prototype.fetch.call(this, {
        success: callback
      });
    },

    /**
     * Unbind events from this collection so it can be garbage collected
     */

    destroy: function() {
      this.reset();
      ticketer.EventEmitter.off(null, null, this);
      return null;
    },

    /**
     * If the comment belongs to the current comment collection's ticket
     * add it to the collection
     *
     * @param {Object} attrs
     */

    addComment: function(attrs) {
      var obj = _.clone(attrs);

      if(obj.ticket === options.ticketId) {
        delete obj.ticket;
        this.add(obj);
      }
    },

    /**
     * If the comment with id `attrs.id` is in this collection,
     * update the attributes
     *
     * @param {Object} attrs
     */

    updateComment: function(attrs) {
      var obj = _.clone(attrs),
          model = this.get(obj.id);

      if(model) {
        model.set(model.parse(obj));
      }
    },

    /**
     * Remove the comment with `id` from this collection
     *
     * @param {String} id
     */

    removeComment: function(id) {
      var model = this.get(id);

      if(model) {
        this.remove(model);
      }
    }
  });

  return Comments;
});
