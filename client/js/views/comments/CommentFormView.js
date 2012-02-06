/* CommentForm
 * Renders the comment form
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/CommentForm.html'],
function($, _, Backbone, BaseView, mustache, form) {

  var CommentFormView = BaseView.extend({

    events: {
      "keypress textarea":  "createOnEnter"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {

      $(this.el).html(Mustache.to_html(form, ticketer.currentUser));

      // Set input to get form values from
      this.input = this.$('form textarea');

      return this;
    },

    // If you hit return submit form to create a
    // a new **Comment** model
    createOnEnter: function(e) {
      if (e.keyCode != 13) { return; }
      if (e.keyCode === 13 && !e.ctrlKey) {
        e.preventDefault();

        var self = this;

        this.collection.create({
          comment: this.input.val(),
          socket: ticketer.sockets.id
        },{
          wait: true
        });

        this.input.val('').blur();
        this.input.css('height', '23px');
      }
    },

    bindResize: function() {
      $('textarea', this.el).autoResize({
        minHeight: 23,
        extraSpace: 14
      });
    }

  });

  return CommentFormView;
});