/* CommentForm
 * Renders the comment form
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/CommentForm.html'],
function($, _, Backbone, BaseView, mustache, form) {

  var CommentFormView = BaseView.extend({
    className: 'comment-form',

    events: {
      "keypress textarea":  "createOnEnter"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(Mustache.to_html(form, ticketer.currentUser));
      return this;
    },

    /**
     * When enter is pressed create a new comment model
     * and resize the textarea to 23px with no content
     *
     * @param {jQuery Event} e
     */

    createOnEnter: function(e) {
      var element = $('textarea', this.$el);

      if (e.keyCode != 13) { return; }
      if (e.keyCode === 13 && !e.ctrlKey) {
        e.preventDefault();

        var self = this;

        this.collection.create({
          comment: element.val(),
          socket: ticketer.sockets.id
        },{
          wait: true
        });

        element.val('').blur();
        element.css('height', '23px');
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