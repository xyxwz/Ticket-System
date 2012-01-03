// Main Router

define(['jquery', 'backbone', 'AppView'], function($, Backbone, AppView) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/new": "createTicket",
      "tickets/:id": "details",
    },

    /* Routing */
    initialize: function(){
      this.appView = new AppView();
    },

    index: function() {
      this.navigate("tickets/open", true);
    },

    openTickets: function() {
      var Header = ticketer.views.headers.main,
          TicketListView = new ticketer.views.tickets.index({ collection: ticketer.collections.tickets });

      // Transitions
      this.appView.showHeader(Header, 'openTickets');
      this.appView.showView(TicketListView);
    },

    closedTickets: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.closedTickets,
          ClosedListView = new ticketer.views.tickets.closed({collection: collection });

      // Transitions
      this.appView.showHeader(Header, 'closedTickets');
      this.appView.showView(ClosedListView);
    },

    details: function(id) {
      var Header = ticketer.views.headers.back,
          ticket = ticketer.collections.tickets.get(id);

      if(typeof(ticket) === 'undefined') {
        ticket = ticketer.collections.closedTickets.get(id);
      }

      var TicketDetailsView = new ticketer.views.tickets.show({ model: ticket });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(TicketDetailsView);
    },

    createTicket: function() {
      var Header = ticketer.views.headers.back,
          TicketFormView = new ticketer.views.tickets.form({ collection: ticketer.collections.tickets });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(TicketFormView);
    },

  });

  return Ticketer;
});