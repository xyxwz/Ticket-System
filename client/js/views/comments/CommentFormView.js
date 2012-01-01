/* CommentForm
 * Renders the comment form
 */

define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/comments/CommentForm.html'], 
function($, _, Backbone, mustache, form) {

  var CommentFormView = Backbone.View.extend({
    el: $('<div id="commentForm"></div>'),

    events: {
      "keypress #commentForm textarea":  "createOnEnter",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(form);

      // Set input to get form values from
      this.input = this.$('form textarea');

      return this;
    },

    // If you hit return submit form to create a
    // a new **Comment** model
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      e.preventDefault();

      this.collection.create({
        comment: this.input.val(),
      });

      this.input.val('').blur();
    },

  });

  return CommentFormView;
});