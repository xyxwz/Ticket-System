/* CommentView
 * Renders a single comment
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/Comment.html', 'text!templates/comments/EditComment.html', 'timeago', 'marked'],
function($, _, Backbone, BaseView, mustache, CommentTmpl, EditTmpl) {

  var CommentView = BaseView.extend({
    tagName: 'div',
    className: 'row comment written',

    events: {
      "click li.delete": "removeComment",
      "click li.edit": "editComment",
      "click .saveComment": "saveComment",
      "click .cancelEdit": "renderEdit",
      "mouseenter": "toggleOptions",
      "mouseleave": "toggleOptions",
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.model, 'change', this.render);
      this.$el.attr('id', this.model.id);
    },

    render: function() {
      var data;

      data = this.model.toJSON();
      data.comment = marked(data.comment);
      $(this.el).html(Mustache.to_html(CommentTmpl, data));
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

    editComment: function() {
      var self = this;

      if($('.commentBody > .commentEdit', this.el).length === 0) {

        $('.commentInfo', this.el).html(Mustache.to_html(EditTmpl, { comment: self.model.get('comment') }));

        $('textarea', this.el).autoResize({
          minHeight: 23,
          extraSpace: 14
        });
      }
    },

    saveComment: function(e) {
      e.preventDefault();

      var self = this,
          comment = $('textarea', this.el).val();

      self.model.save(
        { comment: comment }, { silent: true, success: self.renderEdit });
    },

    renderEdit: function(e) {
      /* just so we don't have to create another function */
      if(e instanceof jQuery.Event) {
        e.preventDefault();
      }

      var self = this;

      $('textarea', this.el).data('AutoResizer').destroy();

      $(this.el).fadeOut(200, function() {
        self.render();
        $(self.el).fadeIn(200);
      });
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
    },

    // Open links within a comment body in a new window
    openLink: function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(e.currentTarget.href);
    }

  });

  return CommentView;
});