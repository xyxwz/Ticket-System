/* ClosedTicketListView
 * Renders a collection of Tickets with status of closed
 */

define(['jquery', 'underscore', 'backbone', 'garbage'],
function($, _, Backbone, BaseView) {

  var ClosedTicketListView = BaseView.extend({

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var self = this;

      _.each(this.collection.models, function(ticket) {

        var view = self.createView(
          ticketer.views.tickets.ticket,
          {model: ticket}
        );

        $(self.el).append(view.render().el);

      });

      return this;
    },

    showDetails: function(e) {
      var id = e.currentTarget.id;
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return ClosedTicketListView;
 });