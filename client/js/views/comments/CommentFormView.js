/* CommentForm
 * Renders the comment form
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/CommentForm.html', 'text!templates/errors/FormError.html'],
function($, _, Backbone, BaseView, mustache, form, FormError) {

  var CommentFormView = BaseView.extend({

    events: {
      "keypress textarea":  "createOnEnter",
      "click #formError .close": "closeError",
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
      if (e.keyCode != 13) { return }
      if (e.keyCode === 13 && !e.ctrlKey) {
        e.preventDefault();

        this.collection.create({
          comment: this.input.val(),
        }, { error: this.creationError,
             success: this.creationSuccess });

        this.input.val('').blur();
      }
    },

    creationError: function(model, err) {
      var errElement = $('#formError', self.el);
      if(errElement.length != 0) {
        errElement.remove();
      }
      var slideErr = $(Mustache.to_html(FormError, { error: err }));
      slideErr.children('.close').click(function(e) {
        e.preventDefault();
        slideErr.remove();
      });

      $('body').append(slideErr.fadeIn(500));
    },

    creationSuccess: function() {
      $('#formError', self.el).remove();
    },

    closeError: function(e) {
      e.preventDefault();
      console.log('fired');
      $('#formError').remove();
    },

    bindResize: function() {
      $('textarea', this.el).autoResize({
        minHeight: 23,
        extraSpace: 14
      });
    },

  });

  return CommentFormView;
});