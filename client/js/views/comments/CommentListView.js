/* CommentListView
 * Renders a collection of ticket comments
 */

define(['jquery', 'underscore', 'backbone', 'views/comments/CommentView'],
function($, _, Backbone, CommentView) {

  var CommentListView = Backbone.View.extend({
    el: $('<div id="comments"></div>'),

    initialize: function() {
      _.bindAll(this);
      $(this.el).html('');
    },

    render: function() {
      var collection = this.collection,
          self = this;

      _.each(collection.models, function(comment) {
        var view = new CommentView({
          model: comment,
        });
        $(self.el).append(view.render().el);
      });
      return this;
    },

  });

  return CommentListView;
 });