/* Comment model - used to represent a single
 * comment */

define(['underscore', 'backbone'], function(_, Backbone) {
  var Comment = Backbone.Model.extend({

    initialize: function() {
      this.on('invalid', function() {
        ticketer.EventEmitter.trigger('error', "Error saving comment");
      });
    },

    /* Validate the comment */
    validate: function(attrs) {
      if(typeof(attrs.comment) !== 'undefined' && !attrs.comment.replace(/ /g, '').length) {
        return "Comment must have content to post.";
      }
    }
  });

  return Comment;
});
