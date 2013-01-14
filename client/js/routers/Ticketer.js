/**
 * Application Router
 */

define([
  'backbone',
  'AppView',
  'views/headers/MainHeaderView',
  'views/main/PanelView',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView',
  'views/toolbars/MainToolbarView'],
function(Backbone, AppView, HeaderView, PanelView, TicketListView,
  TicketDetailsView, TicketFormView, ToolbarView) {

  var Ticketer = Backbone.Router.extend({
    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/closed?*params": "closedTickets",
      "tickets/mine": "myTickets",
      "tickets/new": "createTicket"
    },

    /**
     * Initialize our AppView function that manages main views
     * and toolbar swapping
     */

    initialize: function(){
      this.appView = new AppView();
      this.appView.showToolbar(ToolbarView);

      // Create the Page Header
      var view = new HeaderView();
      $('header').append(view.render().el);
    },

    /**
     * Default view
     */

    index: function() {
      this.navigate("tickets/mine", true);
    },

    openTickets: function() {
      var view,
          self = this;
          collection = ticketer.collections.openTickets;

      view = new PanelView({
        collection: collection,
        list: TicketListView,
        details: TicketDetailsView
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/open');
    },

    closedTickets: function() {
      var view,
          collection = ticketer.collections.closedTickets;

      view = new PanelView({
        collection: collection,
        list: TicketListView,
        details: TicketDetailsView
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/closed');
    },

    myTickets: function() {
      var view,
          collection = ticketer.collections.openTickets;

      view = new PanelView({
        collection: collection,
        list: TicketListView,
        details: TicketDetailsView,
        filter: function(ticket) {
          return ticket.participating();
        }
      });

      this.appView.showView(view);
      this.appView.showToolbarTab('tickets/mine');
    },

    createTicket: function() {
      var view,
          collection = ticketer.collections.openTickets;

      view = new TicketFormView({
        collection: collection
      });

      this.appView.showView(view, function() { view.trigger('viewRendered'); });
      this.appView.showToolbarTab();
    }

  });

  return Ticketer;
});