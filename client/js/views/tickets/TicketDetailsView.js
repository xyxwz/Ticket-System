/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'collections/Comments',
  'views/tickets/TicketView',
  'views/comments/CommentListView',
  'views/comments/CommentFormView'],
function($, _, Backbone, BaseView, Comments,
  TicketView, CommentListView, CommentFormView) {

  /**
   * TicketDetailsView
   * Renders a ticket's details and comments
   *
   * @param {Backbone.Model} model
   */

  var TicketDetailsView = BaseView.extend({
    className: "ticket-details",

    initialize: function() {
      this.comments = new Comments(null, {
        ticketId: this.model.id
      });

      this.bindTo(this.model, 'remove', this.dispose, this);
      this.bindTo(this.comments, 'add', this.scrollToBottom, this);
    },

    render: function() {
      this.renderTicket();
      this.renderComments();
      return this;
    },

    /**
     * Override `.dispose()`
     * When the view is disposed of, remove any notifications.
     */

    dispose: function() {
      if(this.model.notification()) {
        this.model.removeNotification();
      }

      return BaseView.prototype.dispose.call(this);
    },

    renderTicket: function() {
      var view = this.createView(TicketView, {
        model: this.model,
        renderAll: true
      });

      $(this.el).html(view.render().el);
    },

    renderComments: function() {
      var view = this.createView(CommentListView, {
        collection: this.comments
      });

      $(this.el).append(view.render().el);
    },

    /**
     * Scoll to the bottom of the ticket details view
     */

    scrollToBottom: function() {
      this.$el.parent().animate({
        scrollTop: this.$el.height()
      }, 1200);
    }

  });

  return TicketDetailsView;
});