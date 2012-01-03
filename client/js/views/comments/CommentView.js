/* CommentView
 * Renders a single comment
 */

define(['jquery', 'underscore', 'backbone', 'garbage', 'mustache',
'text!templates/comments/Comment.html', 'timeago'],
function($, _, Backbone, BaseView, mustache, comment) {

  var CommentView = BaseView.extend({
    tagName: 'div',
    className: 'row comment written',

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(Mustache.to_html(comment, this.model.toJSON()));
      $('.commentTime time', this.el).timeago();
      return this;
    },

  });

  return CommentView;
});