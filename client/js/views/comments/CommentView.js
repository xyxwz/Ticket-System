/* CommentView
 * Renders a single comment
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/Comment.html', 'timeago', 'marked'],
function($, _, Backbone, BaseView, mustache, comment) {

  var CommentView = BaseView.extend({
    tagName: 'div',
    className: 'row comment written',

    events: {
      "click li.delete": "removeComment",
      "mouseenter": "toggleOptions",
      "mouseleave": "toggleOptions"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var data;

      data = this.model.toJSON();
      data.comment = marked(data.comment);
      $(this.el).html(Mustache.to_html(comment, data));
      $('.commentTime time', this.el).timeago();

      this.checkAbilities(data);

      return this;
    },

    /* Check whether or not to display edit/remove options.
     * The comment must belong to the current user or the
     * current user must have the role admin. If so append the
     * edit button and setup click bindings.
     *
     * :data - the current model in JSON form
     */
    checkAbilities: function(data) {
      if(data.user.id === currentUser.id || currentUser.role === 'admin') {
        var html = "<ul class='commentOptions hide'></ul>";
        $('.commentBody', this.el).append(html);

        // If currentUser is owner allow to both edit and delete
        if(data.user.id === currentUser.id) {
          $('ul.commentOptions', this.el).append('<li class="edit"></li>');
          $('ul.commentOptions', this.el).append('<li class="delete">x</li>');
        }
        else {
          $('ul.commentOptions', this.el).append('<li class="delete">x</li>');
        }
      }
    },

    toggleOptions: function() {
      if ($('ul.commentOptions', this.el).length > 0) {
        // element exists so check if it's showing
        if($('ul.commentOptions', this.el).is(":visible")) {
          $('ul.commentOptions', this.el).fadeOut('100').addClass('hide');
        }
        else {
          $('ul.commentOptions', this.el).hide().removeClass('hide').fadeIn('100');
        }
      }
    },

    removeComment: function() {
      var resp,
          self = this;

      resp = confirm("Are you sure you want to delete this comment? It can not be undone");
      if (resp === true) {
        this.model.destroy();
        $(this.el).fadeOut(200, function() {
          self.remove();
        });
      }
    }

  });

  return CommentView;
});