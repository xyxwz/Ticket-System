// Main Router

define([
  'backbone',
  'AppView',
  'models/Ticket',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView',
  'views/toolbars/AdminToolbarView',
  'views/toolbars/ToolbarView'
],
function(
  Backbone,
  AppView,
  Ticket,
  TicketListView,
  TicketDetailsView,
  TicketFormView,
  AdminToolbarView,
  ToolbarView
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
      var collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection: collection });

      // Transitions
      this.appView.showView(View);

      //Initialize toolbar
      this.initializeToolbar();
    },

    closedTickets: function() {
      var models, View,
          collection = ticketer.collections.closedTickets;

      View = new TicketListView({
        collection: collection,
        status: 'closed'
      });
      this.appView.showView(View);

      //Initialize toolbar
      this.initializeToolbar();
    },

    myActivity: function() {
      var collection = ticketer.collections.openTickets,
          View = new TicketListView({ collection:collection, filter: 'participating' });

      // Transitions
      this.appView.showView(View);

      //Initialize toolbar
      this.initializeToolbar();
    },

    details: function(id) {
      var View,
          ticket = ticketer.collections.openTickets.get(id) ||
                   ticketer.collections.closedTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        this.navigate('tickets/open', true);
      }
      else {
        View = new TicketDetailsView({ model: ticket });
        this.appView.showView(View, function() { View.trigger('viewRendered'); });

        //Initialize toolbar
        this.initializeToolbar();
      }
    },

    createTicket: function() {
      var collection = ticketer.collections.openTickets,
          View = new TicketFormView({ collection: collection });

      // Transitions
      this.appView.showView(View, function() { View.trigger('viewRendered'); });

      //Initialize toolbar
      this.initializeToolbar();
    },

    initializeToolbar: function() {
      if(ticketer.currentUser.role === 'admin') {
        this.appView.showToolbar(AdminToolbarView);
      }
      else {
        this.appView.showToolbar(ToolbarView);
      }
    }

  });

  return Ticketer;
});