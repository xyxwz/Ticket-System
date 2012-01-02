// Main Router

define(['jquery', 'backbone', 'support/transitions'], function($, Backbone, Transitions) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",
      "tickets": "tickets",
      "tickets/closed": "closedTickets",
      "tickets/:id": "details",
    },

    // Paths
    index: function() {
      this.navigate("tickets", true);
    },

    tickets: function() {
      var TicketListView = new ticketer.views.tickets.index({ collection: ticketer.collections.tickets });

      // Transitions
      Transitions.headers('ticketIndexHeader','openTickets');

      $('#main').fadeOut('fast', function() {
        $(this).html(TicketListView.render().el);
      }).fadeIn('fast');
    },

    closedTickets: function() {
      var collection = ticketer.collections.closedTickets,
          ClosedListView = new ticketer.views.tickets.closed({collection: collection });

      // Transitions
      Transitions.headers('ticketIndexHeader','closedTickets');

      $('#main').fadeOut('fast', function() {
        $(this).html(ClosedListView.render().el);
      }).fadeIn('fast');
    },

    details: function(id) {
      var ticket = ticketer.collections.tickets.get(id);
      if(typeof(ticket) === 'undefined') {
        ticket = ticketer.collections.closedTickets.get(id);
      }

      var TicketDetailsView = new ticketer.views.tickets.show({ model: ticket });

      // Transitions
      Transitions.headers('ticketDetailsHeader');

      $('#main').fadeOut('fast', function() {
        $(this).html(TicketDetailsView.render().el);
      }).fadeIn('fast');
    },


  });

  return Ticketer;
});