/* CommentView
 * Renders a single comment
 */

define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/comments/Comment.html'], 
function($, _, Backbone, mustache, comment) {

  var CommentView = Backbone.View.extend({
    tagName: 'div',
    className: 'row comment written',

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(Mustache.to_html(comment, this.model.toJSON()));
      return this;
    },

  });

  return CommentView;
});