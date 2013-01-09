/**
 * Application Router
 */

define(['backbone', 'AppView',
  'views/main/TicketListView',
  'views/main/TicketDetailsView',
  'views/main/TicketFormView',
  'views/toolbars/MainToolbarView'],
function(Backbone, AppView, TicketListView,
  TicketDetailsView, TicketFormView, ToolbarView) {

  var Ticketer = Backbone.Router.extend({
    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/closed?*params": "closedTickets",
      "tickets/mine": "myTickets",
      "tickets/new": "createTicket",
      "tickets/:id": "showTicket",
      "lists/new": "createList",
      "lists/": "showLists",
      "lists/:id": "showList"
    },

    /**
     * Initialize our AppView function that manages main views
     * and toolbar swapping
     */

    initialize: function(){
      this.appView = new AppView();
      this.appView.showToolbar(ToolbarView);
    },

    /**
     * Default view
     */

    index: function() {
      this.navigate("tickets/mine", true);
    },

    openTickets: function() {
      var view,
          collection = ticketer.collections.openTickets;

      view = new TicketListView({
        title: 'Open Tickets',
        collection: collection
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/open');
    },

    closedTickets: function() {
      var view,
          collection = ticketer.collections.closedTickets;

      view = new TicketListView({
        title: 'Closed Tickets',
        collection: collection,
        status: 'closed'
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/closed');
    },

    myTickets: function() {
      var collection = ticketer.collections.openTickets;
      var view = new TicketListView({
        title: 'My Tickets',
        collection: collection,
        filter: function(ticket) {
          return ticket.participating();
        }
      });

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

        this.appView.showView(view);
        this.appView.showToolbarTab();
      }
    },

    createTicket: function() {
      var view,
          collection = ticketer.collections.openTickets;

      view = new TicketFormView({
        collection: collection
      });

      this.appView.showView(view);
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