/* CommentListView
 * Renders a collection of ticket comments
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'views/comments/CommentView'],
function($, _, Backbone, BaseView, CommentView) {

  var CommentListView = BaseView.extend({
    className: 'comment-list',

    initialize: function() {

      // Bindings using the garbage collectors bindTo()
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
      var self = this;

      $(this.el).html('');

      _.each(this.collection.models, function(comment) {
        self.addComment(comment);
      });
    },

    addComment: function(comment) {
      var view = this.createView(
        CommentView,
        {model: comment}
      );

      // Build html and set style to hidden for
      // a nice fadeIn transition
      var html = view.render().el;
      $(html).hide();
      $(this.el).append(html);
      $(html).fadeIn(200);
    },

    removeComment: function(comment) {
      var id = comment.id;
      $('#' + id, this.el).remove();
    }

  });

  return CommentListView;
 });