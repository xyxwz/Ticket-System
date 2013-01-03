// Main Router

define([
  'backbone',
  'AppView',
  'models/Ticket',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView',
  'views/toolbars/ToolbarView'
],
function(
  Backbone,
  AppView,
  Ticket,
  TicketListView,
  TicketDetailsView,
  TicketFormView,
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
      "tickets/:id": "showTicket",
      "lists/new": "createList",
      "lists/": "showLists",
      "lists/:id": "showList"
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
      this.appView.showToolbar(ToolbarView, {selected: 'open'});
    },

    closedTickets: function() {
      var view,
          models,
          collection = ticketer.collections.closedTickets;

      view = new TicketListView({
        collection: collection,
        status: 'closed'
      });

      // Transitions
      this.appView.showView(view);
      this.appView.showToolbar(ToolbarView, {selected: 'closed'});
    },

    myActivity: function() {
      var collection = ticketer.collections.openTickets,
          view = new TicketListView({collection:collection, filter: 'participating' });

      // Transitions
      this.appView.showView(view);
      this.appView.showToolbar(ToolbarView, {selected: 'activity'});
    },

    showTicket: function(id) {
      var view,
          ticket = ticketer.collections.openTickets.get(id) ||
                   ticketer.collections.closedTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        this.navigate('tickets/open', true);
      }
      else {
        view = new TicketDetailsView({model: ticket});

        // Transitions
        this.appView.showView(View, function() { View.trigger('viewRendered'); });
        this.appView.showView(ToolbarView);
      }
    },

    createTicket: function() {
      var collection = ticketer.collections.openTickets,
          View = new TicketFormView({collection: collection});

      // Transitions
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
      this.appView.showView(ToolbarView);
    },

    showList: function(id) {
      var list = ticketer.collections.lists.get(id);

      if(list) {
        this.appView.showView(new ListView({model: list}));
        this.appView.showToolbar(ToolbarView, {selected: true});
      }
      else {
        this.navigate('tickets/open', true);
      }
    },

    showLists: function() {

    }

  });

  return Ticketer;
});