// Main Router

define([
  'backbone',
  'AppView',
  'models/Ticket',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView'
],
function(
  Backbone,
  AppView,
  Ticket,
  TicketListView,
  TicketDetailsView,
  TicketFormView
) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/open?*params": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/closed?*params": "closedTickets",
      "tickets/mine": "myTickets",
      "tickets/mine?*params": "myTickets",
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

    openTickets: function(id) {
      var Header = ticketer.views.headers.main,
          models = ticketer.collections.openTickets.models,
          View = new TicketListView({ models: models });

      // Transitions
      this.appView.showHeader(Header, 'openTickets');
      this.appView.showView(View);
    },

    closedTickets: function() {
      var Header = ticketer.views.headers.main,
          models = ticketer.collections.closedTickets.models,
          View = new TicketListView({ models: models });

      // Transitions
      this.appView.showHeader(Header, 'closedTickets');
      this.appView.showView(View);
    },

    myTickets: function() {
      var Header = ticketer.views.headers.main,
          models = ticketer.collections.openTickets.mine,
          View = new TicketListView({ models: models });

      // Transitions
      this.appView.showHeader(Header, 'myTickets');
      this.appView.showView(View);
    },

    details: function(id) {
      var Header = ticketer.views.headers.back,
          self = this,
          View,
          ticket = ticketer.collections.openTickets.get(id) ||
                   ticketer.collections.closedTickets.get(id) ||
                   ticketer.collections.myTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        ticket = new Ticket({id: id});
        ticket.fetch({
          success: function(){
            View = new TicketDetailsView({ model: ticket });
            // Transitions
            self.appView.showHeader(Header);
            self.appView.showView(View);
          },
        });
      }
      else {
        View = new TicketDetailsView({ model: ticket });
        // Transitions
        this.appView.showHeader(Header);
        this.appView.showView(View);
      }

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