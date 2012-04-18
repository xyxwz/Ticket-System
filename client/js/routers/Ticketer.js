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
      "tickets/activity": "myActivity",
      "tickets/activity?*params": "myActivity",
      "tickets/new": "createTicket",
      "tickets/:id": "details"
    },

    /* Routing */
    initialize: function(){
      this.appView = new AppView();
    },

    index: function() {
      this.navigate("tickets/activity", true);
    },

    openTickets: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection: collection });

      // Transitions
      this.appView.showHeader(Header, { tab: 'openTickets' });
      this.appView.showView(View);
    },

    closedTickets: function() {
      var self, Header, collection, models, View;

      self = this;
      Header = ticketer.views.headers.main;
      collection = ticketer.collections.closedTickets;

      this.appView.showHeader(Header, { tab: 'closedTickets' });

      View = new TicketListView({
        collection: collection,
        status: 'closed'
      });
      self.appView.showView(View);
    },

    myActivity: function() {
      var Header = ticketer.views.headers.main,
          collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection:collection, filter: 'participating' });

      // Transitions
      this.appView.showHeader(Header, { tab: 'myTickets' });
      this.appView.showView(View);

    },

    details: function(id) {
      var View,
          Header = ticketer.views.headers.back,
          ticket = ticketer.collections.openTickets.get(id) ||
                   ticketer.collections.closedTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        this.navigate('tickets/open', true);
      }
      else {
        View = new TicketDetailsView({ model: ticket });
        this.appView.showHeader(Header, { status: ticket.get('status') });
        this.appView.showView(View, function() { View.trigger('viewRendered'); });
      }
    },

    createTicket: function() {
      var Header = ticketer.views.headers.back,
          collection = ticketer.collections.openTickets,
          View = new TicketFormView({ collection: collection });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
    }

  });

  return Ticketer;
});