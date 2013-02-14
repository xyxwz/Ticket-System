/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/comments/Comment.html', 'text!templates/comments/EditComment.html', 'moment', 'marked'],
function($, _, Backbone, BaseView, mustache, CommentTmpl, EditTmpl) {

  /**
   * CommentView
   * Renders a single comment
   *
   * @param {Backbone.Model} model
   */

  var CommentView = BaseView.extend({
    className: 'comment',
    tagName: 'li',

    events: {
      "click [data-action='delete']": "removeComment",
      "click [data-action='edit']": "editComment",
      "click [data-action='save']": "saveComment",
      "click [data-action='cancel']": "renderEdit",
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.model, 'change', this.render);
      this.$el.attr('data-id', this.model.id);
    },

    /**
     * Override the base `dispose()`
     */

    dispose: function() {
      var plugin = this.$el.find('textarea');

      if(plugin.length > 0) {
        plugin = plugin.data('AutoResizer');

        if(plugin) {
          plugin.destroy();
        }
      }

      return BaseView.prototype.dispose.call(this);
    },

    render: function() {
      var data;

      data = this.model.toJSON();

      var momentObj = moment(new Date(data.created_at));
      data.cleanTime = momentObj.fromNow();

      data.isDeletable = this.isDeletable(data);
      data.isEditable = this.isEditable(data);
      data.comment = marked(data.comment);

      $(this.el).html(Mustache.to_html(CommentTmpl, data));

      return this;
    },

    renderEdit: function(e) {
      var self = this,
          plugin = this.$el.find('textarea').data('AutoResizer');

      if(plugin) {
        plugin.destroy();
      }

      this.$el.fadeOut(200, function() {
        self.render();
        self.$el.fadeIn(200);
      });

       /* just so we don't have to create another function */
      if(e instanceof jQuery.Event) {
        e.preventDefault();
      }
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
              ticketer.currentUser.role === 'admin';
    },

    editComment: function(e) {
      this.$el.find('.body').html(Mustache.to_html(EditTmpl, {
        comment: this.model.get('comment')
      }));

      this.$el.find('textarea').autoResize({
        minHeight: 64,
        extraSpace: 10
      });

      this.$el.find('.edit-actions').hide();

      e.preventDefault();
    },

    saveComment: function(e) {
      var self = this,
          comment = this.$el.find('textarea').val();

      self.model.save({comment: comment}, {
        silent: true,
        success: self.renderEdit
      });

      e.preventDefault();
    },

    removeComment: function(e) {
      var resp,
          self = this;

      resp = confirm("Are you sure you want to delete this comment? It cannot be undone");
      if (resp === true) {
        this.model.destroy();
        $(this.el).fadeOut(200, function() {
          self.remove();
        });
      }

      e.preventDefault();
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