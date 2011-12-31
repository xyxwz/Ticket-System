/* TicketView
 * Renders a single Ticket
 */

define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/tickets/Ticket.html'], 
function($, _, Backbone, mustache, ticket) {

  var TicketView = Backbone.View.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      // Add comments length from model object to
      // data attributes
      var data = this.model.toJSON();
      data.comments = this.model.comments.length;
      $(this.el).html(Mustache.to_html(ticket, data));
      return this;
    },

    showDetails: function() {
      ticketer.routers.ticketer.navigate("tickets/"+this.model.id, true);
    },

  });

  return TicketView;
});