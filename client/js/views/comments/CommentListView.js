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

      $(this.el).html('<div id="commentList"></div>');
    },

    render: function() {
      var self = this;

      _.each(this.collection.models, function(comment) {
        self.addComment(comment);
      });

      this.addForm();

      return this;
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
      $("#commentList", this.el).append(html)
      $(html).fadeIn(200);
    },

    addForm: function() {
      var self = this;

      var commentForm = this.createView(
        ticketer.views.comments.form,
        {collection: self.collection}
      );

      $(this.el).append(commentForm.render().el);
    },

  });

  return CommentListView;
 });