/* TicketDetailsView
 * Renders a ticket's details and comments
 */

define(['jquery', 'underscore', 'backbone', 'garbage'],
function($, _, Backbone, BaseView) {

  var TicketDetailsView = BaseView.extend({

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.renderTicket();
      this.renderComments();
      this.renderCommentForm();
      return this;
    },

    renderTicket: function() {
      var ticketView = this.createView(
        ticketer.views.tickets.ticket,
        {model: this.model}
      );

      $(this.el).html(ticketView.render().el);
    },

    renderComments: function() {
      var CommentList = this.createView(
        ticketer.views.comments.index,
        {collection: this.model.comments}
      );

      $(this.el).append(CommentList.render().el);
    },

    renderCommentForm: function() {
      var self = this;

      var commentForm = this.createView(
        ticketer.views.comments.form,
        {collection: self.model.comments}
      );

      $(this.el).append(commentForm.render().el);
    },

  });

  return TicketDetailsView;
});