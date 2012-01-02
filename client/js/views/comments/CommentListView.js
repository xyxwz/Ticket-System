/* CommentListView
 * Renders a collection of ticket comments
 */

define(['jquery', 'underscore', 'backbone', 'garbage'],
function($, _, Backbone, BaseView) {

  var CommentListView = BaseView.extend({

    initialize: function() {

      // Bindings using the garbage collectors bindTo()
      _.bindAll(this);
      this.bindTo(this.collection,'add', this.addComment);
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
      var commentView = this.createView(
        ticketer.views.comments.comment,
        {model: comment}
      );

      // Build html and set style to hidden for
      // a nice fadeIn transition
      var html = commentView.render().el;
      $(html).hide();
      $(this.el).append(html);
      $(html).fadeIn(200);
    },

  });

  return CommentListView;
 });