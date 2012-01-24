// Main Router

define([
  'backbone',
  'AppView',
  'models/Ticket',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/TicketFormView',
  'views/errors/ErrorView'
],
function(
  Backbone,
  AppView,
  Ticket,
  TicketListView,
  TicketDetailsView,
  TicketFormView,
  ErrorView
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

    openTickets: function() {
      var Header = ticketer.views.headers.main,
          models = ticketer.collections.openTickets.models,
          View = new TicketListView({ models: models });

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
            models = collection.models;
            View = new TicketListView({
              collection: collection,
              models: models,
              status: 'closed'
            });
            self.appView.showView(View);
          },
        });
      }
      else {
        models = collection.models;
        View = new TicketListView({
          collection: collection,
          models: models,
          status: 'closed'
        });
        self.appView.showView(View);
      }
    },

    myTickets: function() {
      var Header = ticketer.views.headers.main,
          models = ticketer.collections.openTickets.mine,
          View = new TicketListView({ models: models });

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
          },
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

      View.bind('view:error', this.displayError, this);

      // Transitions
      this.appView.showHeader(Header);
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
    },

    /* All helper functions */
    displayError: function(err) {
      this.appView.showError(ErrorView, err);
    },

    displayView: function(model) {
      var Header = ticketer.views.headers.back,
          View = new TicketDetailsView({ model: model });
      
      View.bind('view:error', this.displayError, this);
      this.appView.showHeader(Header, { status: model.get('status') });
      this.appView.showView(View, function() { View.trigger('viewRendered'); });
    },

  });

  return Ticketer;
});