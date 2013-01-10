/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/comments/CommentView',
  'views/comments/CommentFormView'],
function($, _, Backbone, BaseView, CommentView, FormView) {

  /**
   * CommentListView
   * Renders a collection of ticket comments
   *
   * @param {Backbone.Collection} collection
   */

  var CommentListView = BaseView.extend({
    className: 'comment-list',

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection,'add', this.addComment);
      this.bindTo(this.collection, 'remove', this.removeComment);
      this.bindTo(this.collection,'reset', this.addAll);
    },

    render: function() {
      this.addAll();
      return this;
    },

    addAll: function() {
      var form = this.createView(FormView, {
        collection: this.collection
      });

      $(this.el).html(form.render().el);
      this.collection.each(this.addComment);
    },

    addComment: function(comment) {
      var view = this.createView(CommentView, {
        model: comment
      });

      // Build html and set style to hidden for
      // a nice fadeIn transition
      var html = view.render().el;
      $(html).hide();
      $('.comment-form', this.el).before(html);
      $(html).fadeIn(200);
    },

    removeComment: function(comment) {
      var id = comment.id;
      $('#' + id, this.el).remove();
    }

  });

  return CommentListView;
 });