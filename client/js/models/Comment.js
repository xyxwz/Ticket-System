/* Comment model - used to represent a single
 * comment */

define(['underscore', 'backbone'], function(_, Backbone) {
  var Comment = Backbone.Model.extend({

    initialize: function() {
      this.validate = this._validate;

      this.on('error', function(model, err) {
        ticketer.EventEmitter.trigger('error', err);
      });
    },

    /* Validate the comment */
    _validate: function(attrs) {
      if(typeof(attrs.comment) !== 'undefined' && !attrs.comment.replace(/ /g, '').length) {
        return "Comment must have content to post.";
      }
    },
    
    /* Updates the Comment with the attributes passed in
     * the comment argument, also take a save error callback */
    updateComment: function(comment, callback) {

      if (comment) {
        this.set({ comment: comment });
      }
      this.save(null, { error: callback });

    },
  
  });

  return Comment;
});
