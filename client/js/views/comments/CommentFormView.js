/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
  'text!templates/comments/CommentForm.html'],
function($, _, Backbone, BaseView, mustache, FormTmpl) {

  /**
   * CommentForm
   * Renders the comment form
   *
   * @param {Backbone.Collection} collection
   */

  var CommentFormView = BaseView.extend({
    className: 'comment-form comment',
    events: {
      "click [data-action='create']":  "create",
      "focus textarea": "initResize"
    },

    render: function() {
      $(this.el).html(Mustache.to_html(FormTmpl));
      return this;
    },

    initResize: function() {
      $('textarea', this.el).autoResize({
        minHeight: 64,
        extraSpace: 10
      });
    },

    /**
     * Override the default dispose function to destroy the
     * autoresize plugin
     */

    dispose: function() {
      var plugin = this.$el.find('textarea').data('AutoResizer');

      if(plugin) {
        plugin.destroy();
      }

      return BaseView.prototype.dispose.call(this);
    },

    /**
     * When enter is pressed create a new comment model
     * and resize the textarea to 23px with no content
     *
     * @param {jQuery Event} e
     */

    create: function() {
      var element = this.$el.find('textarea');

      this.collection.create({comment: element.val()}, {
        wait: true
      });

      element.val('').blur();
      element.css({height: '64px'});
    }
  });

  return CommentFormView;
});