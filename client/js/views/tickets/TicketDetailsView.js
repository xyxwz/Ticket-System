/* TicketDetailsView
 * Renders a ticket's details and comments
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
'views/tickets/TicketView', 'views/comments/CommentListView', 'views/comments/CommentFormView'],
function($, _, Backbone, BaseView, TicketView, CommentListView, CommentFormView) {

  var TicketDetailsView = BaseView.extend({
    className: "ticket-details",

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.model, 'remove', this.goBack);
    },

    render: function() {
      this.model.removeNotification();
      this.renderTicket();
      this.renderComments();
      this.renderCommentForm();
      return this;
    },

    renderTicket: function() {
      var self = this,
          view = this.createView(
            TicketView,
            { model: this.model, admin: true }
          );

      $(this.el).html(view.render().el);
    },

    renderComments: function() {
      var view = this.createView(
        CommentListView,
        {collection: this.model.comments}
      );

      $(this.el).append(view.render().el);
    },

    renderCommentForm: function() {
      var self = this;

      var view = this.createView(
        CommentFormView,
        {collection: self.model.comments}
      );

      this.bindTo(this, 'viewRendered', view.bindResize);

      $(this.el).append(view.render().el);
    },

    goBack: function() {
      window.history.back();
    }

  });

  return TicketDetailsView;
});