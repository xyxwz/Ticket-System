/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/tickets/TicketView',
  'views/comments/CommentListView',
  'views/comments/CommentFormView'],
function($, _, Backbone, BaseView, TicketView,
  CommentListView, CommentFormView) {

  /**
   * TicketDetailsView
   * Renders a ticket's details and comments
   *
   * @param {Backbone.Model} model
   */

  var TicketDetailsView = BaseView.extend({
    className: "ticket-details",

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.model, 'remove', this.dispose);
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
        admin: true,
        renderAll: true
      });

      $(this.el).html(view.render().el);
    },

    renderComments: function() {
      var view = this.createView(CommentListView, {
        collection: this.model.comments
      });

      $(this.el).append(view.render().el);
    }

  });

  return TicketDetailsView;
});