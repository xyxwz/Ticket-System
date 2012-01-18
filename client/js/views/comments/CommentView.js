/* CommentView
 * Renders a single comment
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/Comment.html', 'timeago', 'marked'],
function($, _, Backbone, BaseView, mustache, comment) {

  var CommentView = BaseView.extend({
    tagName: 'div',
    className: 'row comment written',

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var data;

      data = this.model.toJSON();
      data.comment = marked(data.comment);
      $(this.el).html(Mustache.to_html(comment, data));
      $('.commentTime time', this.el).timeago();
      return this;
    },

  });

  return CommentView;
});