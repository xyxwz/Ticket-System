/* Comment collection - used to represent a collection
 * of comments on a single ticket model */

define(['underscore', 'backbone', 'models/Comment'], function(_, Backbone, Comment) {
  var Comments = Backbone.Collection.extend({

    model: Comment,

    initialize: function() {

      var self = this;

      this.comparator = function(model) {
        var date = new Date(model.get("created_at"));
        return date.getTime();
      };

      this.on('add', function(model) {
        self.trigger('comments:add', model);
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

    /* Drop all comments associated with the Ticket */
    removeComments: function(callback) {

      var op = this;
      this.each(function(comment) {

        comment.destroy({ error: callback });

      });

    }

  });

  return Comments;
});
