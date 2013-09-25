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
      this.bindTo(this.model, 'remove', this.dispose, this);
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
      var collection = new Comments(null, {
        ticketId: this.model.id
      });

      var view = this.createView(CommentListView, {
        collection: collection
      });

      $(this.el).append(view.render().el);
    }

  });

  return TicketDetailsView;
});