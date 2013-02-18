/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/helpers/SpinnerView',
  'views/comments/CommentView',
  'views/comments/CommentFormView',
  'text!templates/comments/CommentList.html'],
function($, _, Backbone, BaseView, SpinnerView,
  CommentView, FormView, tmpl_CommentList) {

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
    },

    render: function() {
      var self = this,
          loading = new SpinnerView();

      this.$el.html(tmpl_CommentList);
      this.renderCommentForm();

      this.$el.append(loading.render().el);
      this.collection.fetch(function() {
        self.$el.children('.comments-list').hide();
        self.collection.each(self.addComment);

        loading.$el.fadeOut(400, function() {
          loading.dispose();
          self.$el.children('.comments-list').fadeIn(400);
        });
      });

      return this;
    },

    /**
     * Override `dispose()` and call `destroy()` on the collection
     */

    dispose: function() {
      this.collection = this.collection.destroy();
      delete this.collection;
      return BaseView.prototype.dispose.call(this);
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