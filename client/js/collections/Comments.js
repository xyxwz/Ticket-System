/* Comment collection - used to represent a collection
 * of comments on a single ticket model */

define(['underscore', 'backbone', 'models/Comment'], function(_, Backbone, Comment) {

  var Comments = Backbone.Collection.extend({
    model: Comment,

    initialize: function(models, options) {
      var self = this;

      // Set url for this comment collection
      this.url = '/api/tickets/' + options.ticketId + '/comments';

      this.comparator = function(model) {
        var date = new Date(model.get("created_at"));
        return date.getTime();
      };

      ticketer.EventEmitter.on('comment:new', function(attrs) {
        var obj = _.clone(attrs);

        if(obj.ticket === options.ticketId) {
          delete obj.ticket;
          self.add(obj);
        }
      });

      // Update attributes on changed model
      ticketer.EventEmitter.on('comment:update', function(attrs) {
        var obj = _.clone(attrs),
            model = self.get(obj.id);

        if(model) {
          model.set(model.parse(obj));
        }
      });

      // Remove model from collection
      ticketer.EventEmitter.on('comment:remove', function(id) {
        var model = self.get(id);

        if(model) {
          self.remove(model);
        }
      });
    },

    /**
     * Override `Collection.fetch` for a neat callback
     */

    fetch: function(callback) {
      Backbone.Collection.prototype.fetch.call(this, {
        success: callback
      });
    }
  });

  return Comments;
});
