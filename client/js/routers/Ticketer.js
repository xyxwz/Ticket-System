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
      "tickets/mine": "myTickets",
      "tickets/new": "createTicket",
      "tickets/:id": "showTicket",
      "lists/new": "createList",
      "lists/": "showLists",
      "lists/:id": "showList"
    },

    /* Routing */
    initialize: function(){
      this.appView = new AppView();
      this.appView.showToolbar(ToolbarView);
    },

    index: function() {
      this.navigate("tickets/mine", true);
    },

    openTickets: function() {
      var collection = ticketer.collections.openTickets,
          view = new TicketListView({ collection: collection });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/open');
    },

    closedTickets: function() {
      var view,
          models,
          collection = ticketer.collections.closedTickets;

      view = new TicketListView({
        collection: collection,
        status: 'closed'
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/closed');
    },

    myTickets: function() {
      var collection = ticketer.collections.openTickets,
          view = new TicketListView({collection:collection, filter: 'participating' });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/mine');
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

        this.appView.showView(view, function() { view.trigger('viewRendered'); });
        this.appView.showToolbarTab();
      }
    },

    createTicket: function() {
      var collection = ticketer.collections.openTickets,
          view = new TicketFormView({collection: collection});

      this.appView.showView(view, function() { view.trigger('viewRendered'); });
      this.appView.showToolbarTab();
    },

    showList: function(id) {
      var list = ticketer.collections.lists.get(id);

      if(list) {
        this.appView.showView(new ListView({model: list}));
        this.appView.showToolbarTab();
      }
      else {
        this.navigate('tickets/open', true);
      }
    },

    showLists: function() {
      var collection = ticketer.collections.lists;

      this.appView.showView(new ListsView({collection: collection}));
      this.appView.showToolbarTab('lists/');
    }

  });

  return Ticketer;
});