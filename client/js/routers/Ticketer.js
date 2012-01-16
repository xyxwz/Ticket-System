// Main Router

define([
  'backbone',
  'AppView',
  'models/Ticket',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView',
  'views/tickets/MyTicketListView'
],
function(
  Backbone,
  AppView,
  Ticket,
  TicketListView,
  TicketDetailsView,
  TicketFormView,
  MyTicketListView
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
          collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection: collection, status: 'open' });

      // Transitions
      this.appView.showHeader(Header, 'openTickets');
      this.appView.showView(View, {
        triggers: ['timeline'],
      });
    },

    closedTickets: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.closedTickets,
          View = new TicketListView({collection: collection, status: 'closed' });

      // Transitions
      this.appView.showHeader(Header, 'closedTickets');
      this.appView.showView(View, {
        triggers: ['timeline'],
      });
    },

    myTickets: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.myTickets,
          View = new MyTicketListView({ collection: collection });

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