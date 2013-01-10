/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/Comment.html', 'text!templates/comments/EditComment.html', 'timeago', 'marked'],
function($, _, Backbone, BaseView, mustache, CommentTmpl, EditTmpl) {

  /**
   * CommentView
   * Renders a single comment
   *
   * @param {Backbone.Model} model
   */

  var CommentView = BaseView.extend({
    className: 'comment',

    events: {
      "click [data-action='delete']": "removeComment",
      "click [data-action='edit']": "editComment",
      "click [data-action='save']": "saveComment",
      "click [data-action='cancel']": "renderEdit",
      "mouseenter": "toggleOptions",
      "mouseleave": "toggleOptions",
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.model, 'change', this.render);
      this.$el.attr('data-id', this.model.id);
    },

    render: function() {
      var data;

      data = this.model.toJSON();
      data.isDeletable = this.isDeletable(data);
      data.isEditable = this.isEditable(data);
      data.comment = marked(data.comment);

      $(this.el).html(Mustache.to_html(CommentTmpl, data));
      $('time', this.el).timeago();

      return this;
    },

    /**
     * Should this comment be editable?
     *
     * @return {Boolean}
     */

    isEditable: function(data) {
      return data.user.id === ticketer.currentUser.id;
    },

    /**
     * Should this comment be deletable?
     *
     * @return {Boolean}
     */

    isDeletable: function(data) {
      return data.user.id === ticketer.currentUser.id ||
              ticketer.currentUser === 'admin';
    },

    toggleOptions: function() {
      // element exists so check if it's showing
      if($('.options', this.el).is(":visible")) {
        $('.options', this.el).fadeOut('100');
      }
      else {
        $('.options', this.el).fadeIn('100');
      }
    },

    editComment: function() {
      var self = this;

      if($('.body > .comment-form', this.el).length === 0) {

        $('.body', this.el).html(Mustache.to_html(EditTmpl, { comment: self.model.get('comment') }));

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

      self.model.save({comment: comment}, {
        silent: true,
        success: self.renderEdit
      });
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

      resp = confirm("Are you sure you want to delete this comment? It cannot be undone");
      if (resp === true) {
        this.model.destroy();
        $(this.el).fadeOut(200, function() {
          self.remove();
        });
      }
    },

    /**
     * Open a link clicked in the comment body in a new window
     */

    openLink: function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(e.currentTarget.href);
    }

  });

  return CommentView;
});