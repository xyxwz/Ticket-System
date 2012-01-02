// Main Router

define(['jquery', 'backbone'], function($, Backbone) {

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
      $('header').fadeOut('fast');

      $('#main').fadeOut('fast', function() {
        $(this).html(TicketListView.render().el);
      }).fadeIn('fast');
    },

    closedTickets: function() {
      var collection = ticketer.collections.closedTickets,
          ClosedListView = new ticketer.views.tickets.closed({collection: collection });

      // Transitions
      $('header').fadeOut('fast');

      $('#main').fadeOut('fast', function() {
        $(this).html(ClosedListView.render().el);
      }).fadeIn('fast');

      // If collection is empty try a fetch
      if(collection.length === 0) {
        collection.fetch({data: {status: 'closed'}});
      }
    },

    details: function(id) {
      var ticket = ticketer.collections.tickets.get(id);
      if(typeof(ticket) === 'undefined') {
        ticket = ticketer.collections.closedTickets.get(id);
      }


      var TicketDetailsView = new ticketer.views.tickets.show({ model: ticket });

      // Transitions
      $('header').fadeOut('fast');

      $('#main').fadeOut('fast', function() {
        $(this).html(TicketDetailsView.render().el);
      }).fadeIn('fast');
    },


  });

  return Ticketer;
});