/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/comments/CommentView',
  'views/comments/CommentFormView',
  'text!templates/comments/CommentList.html'],
function($, _, Backbone, BaseView, CommentView, FormView, tmpl_CommentList) {

  /**
   * CommentListView
   * Renders a collection of ticket comments
   *
   * @param {Backbone.Collection} collection
   */

  var CommentListView = BaseView.extend({
    className: 'comments-wrapper',

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection,'add', this.addComment);
      this.bindTo(this.collection, 'remove', this.removeComment);
      this.bindTo(this.collection,'reset', this.addAll);
    },

    render: function() {
      this.$el.empty();

      $(this.el).html(tmpl_CommentList);

      this.renderCommentForm();
      this.collection.each(this.addComment);

      return this;
    },

    renderCommentForm: function() {
      var form = this.createView(FormView, {
        collection: this.collection
      });

      $('[role=comment-form]', this.$el).html(form.render().el);
    },

    addComment: function(comment) {
      var view = this.createView(CommentView, {
        model: comment
      });

      // Build html and set style to hidden for
      // a nice fadeIn transition
      var html = view.render().el;
      $(html).hide();
      $('[role=comment-list]', this.$el).prepend(html);
      $(html).fadeIn(200);
    },

    removeComment: function(comment) {
      var id = comment.id;
      $('#' + id, this.el).remove();
    }

  });

  return CommentListView;
 });