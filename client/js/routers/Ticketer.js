// Main Router

define([
  'backbone',
  'AppView',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/ClosedTicketListView',
  'views/tickets/TicketFormView',
],
function(
  Backbone,
  AppView,
  TicketListView,
  TicketDetailsView,
  ClosedTicketListView,
  TicketFormView
) {

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
          collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection: collection });

      // Transitions
      this.appView.showHeader(Header, 'openTickets');
      this.appView.showView(View);
    },

    closedTickets: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.closedTickets,
          View = new ClosedTicketListView({collection: collection });

      // Transitions
      this.appView.showHeader(Header, 'closedTickets');
      this.appView.showView(View);
    },

    details: function(id) {
      var Header = ticketer.views.headers.back,
          ticket = ticketer.collections.openTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        ticket = ticketer.collections.closedTickets.get(id);
      }

      var View = new TicketDetailsView({ model: ticket });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(View);
    },

    createTicket: function() {
      var Header = ticketer.views.headers.back,
          collection = ticketer.collections.openTickets,
          View = new TicketFormView({ collection: collection });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(View);
    },

  });

  return Ticketer;
});