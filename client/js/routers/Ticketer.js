// Main Router

define(['jquery', 'backbone', 'AppView','support/transitions'], function($, Backbone, AppView, Transitions) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",
      "tickets": "tickets",
      "tickets/closed": "closedTickets",
      "tickets/:id": "details",
    },

    /* Routing */
    initialize: function(){
      this.appView = new AppView();
    },

    index: function() {
      this.navigate("tickets", true);
    },

    tickets: function() {
      var TicketListView = new ticketer.views.tickets.index({ collection: ticketer.collections.tickets });

      // Transitions
      Transitions.headers('ticketIndexHeader','openTickets');
      this.appView.showView(TicketListView);
    },

    closedTickets: function() {
      var collection = ticketer.collections.closedTickets,
          ClosedListView = new ticketer.views.tickets.closed({collection: collection });

      // Transitions
      Transitions.headers('ticketIndexHeader','closedTickets');
      this.appView.showView(ClosedListView);
    },

    details: function(id) {
      var ticket = ticketer.collections.tickets.get(id);
      if(typeof(ticket) === 'undefined') {
        ticket = ticketer.collections.closedTickets.get(id);
      }

      var TicketDetailsView = new ticketer.views.tickets.show({ model: ticket });

      // Transitions
      Transitions.headers('ticketDetailsHeader');
      this.appView.showView(TicketDetailsView);
    },

  });

  return Ticketer;
});