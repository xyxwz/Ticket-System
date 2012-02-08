/* Comment collection - used to represent a collection
 * of comments on a single ticket model */

define(['underscore', 'backbone', 'models/Comment'], function(_, Backbone, Comment) {
  var Comments = Backbone.Collection.extend({

    model: Comment,

    initialize: function() {

      var self = this;

      this.comparator = function(model) {
        return model.get("created_at");
      };

      this.on('add', function(model) {
        self.trigger('comments:add', model);
      });

      // Update attributes on changed model
      ticketer.EventEmitter.on('comment:update', function(model) {
        var comment = self.get(model.id);

        if(comment) {
          comment.set(comment.parse(model));
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
