/* Comment model - used to represent a single
 * comment */

define(['underscore', 'backbone'], function(_, Backbone) {
  var Comment = Backbone.Model.extend({

    initialize: function() {
      
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
