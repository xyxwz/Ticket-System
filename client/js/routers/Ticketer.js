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
      this.navigate("tickets/open", true);
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

      if (collection.length < 1) {
        collection.fetch({
          data: { page: 1, status: 'closed' } ,
          success: function(collection, response) {
            View = new TicketListView({
              collection: collection,
              status: 'closed'
            });
            self.appView.showView(View);
          }
        });
      }
      else {
        View = new TicketListView({
          collection: collection,
          status: 'closed'
        });
        self.appView.showView(View);
      }
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
      var self = this,
          View,
          ticket = ticketer.collections.openTickets.get(id) ||
                   ticketer.collections.closedTickets.get(id);

      if(typeof(ticket) === 'undefined') {
        ticket = new Ticket({id: id});
        ticket.fetch({
          success: function(model, response){
            model.comments.fetch();
            self.displayView(ticket);
          }
        });
      }
      else {
        this.displayView(ticket);
      }
    },

    createTicket: function() {
      var Header = ticketer.views.headers.back,
          collection = ticketer.collections.openTickets,
          View = new TicketFormView({ collection: collection });

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
    },

    /* All helper functions */
    displayView: function(model) {
      var Header = ticketer.views.headers.back,
          View = new TicketDetailsView({ model: model });

      this.appView.showHeader(Header, { status: model.get('status') });
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
    }

  });

  return Ticketer;
});