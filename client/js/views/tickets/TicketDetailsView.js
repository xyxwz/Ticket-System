/* TicketDetailsView
 * Renders a ticket's details and comments
 */

define(['jquery', 'underscore', 'backbone', 'views/tickets/TicketView'], 
function($, _, Backbone, TicketView) {

  var TicketDetailsView = Backbone.View.extend({
    el: $('<div id="ticketDetails"></div>'),

    initialize: function() {
      _.bindAll(this);
      $(this.el).html(''); // clear out content
    },

    render: function() {
      var ticket = this.model;
          comments = this.model.comments;

      // Render Ticket
      var ticketView = new TicketView({
        model: ticket,
      });
      $(this.el).html(ticketView.render().el);

      // Render Comments
      var CommentListView = new ticketer.views.comments.index({
        collection: comments,
      });
      $(this.el).append(CommentListView.render().el);

      return this;
    },

  });

  return TicketDetailsView;
 });