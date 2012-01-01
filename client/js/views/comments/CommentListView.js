/* CommentListView
 * Renders a collection of ticket comments
 */

define(['jquery', 'underscore', 'backbone', 'views/comments/CommentView', 'views/comments/CommentFormView'],
function($, _, Backbone, CommentView, CommentFormView) {

  var CommentListView = Backbone.View.extend({
    el: $('<div id="comments"></div>'),

    initialize: function() {
      _.bindAll(this);

      this.collection.bind('add', this.addComment);

      $(this.el).html('<div id="commentList"></div>');
    },

    render: function() {
      var collection = this.collection,
          self = this;

      _.each(collection.models, function(comment) {
        self.addComment(comment);
      });

      // Add CommentFormView
      var form = new CommentFormView({
        collection: collection,
      });
      $(this.el).append(form.render().el);

      return this;
    },

    addComment: function(comment) {
      var view = new CommentView({
        model: comment,
      });

      // Build html and set style to hidden for
      // a nice fadeIn transition
      var html = view.render().el;
      $(html).hide();
      $("#commentList", this.el).append(html)
      $(html).fadeIn(200);
    },

  });

  return CommentListView;
 });