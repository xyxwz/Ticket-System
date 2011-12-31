/* Comment collection - used to represent a collection
 * of comments on a single ticket model */

define(['underscore', 'backbone', 'models/comment'], function(_, Backbone, Comment) {
  var Comments = Backbone.Collection.extend({

    model: Comment,

    /* Drop all comments associated with the Ticket */
    removeComments: function(callback) {

      var op = this;
      this.each(function(comment) {

        comment.destroy({ error: callback });

      });

    },

  });

  return Comments;
});
