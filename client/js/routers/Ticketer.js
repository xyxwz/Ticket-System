// Main Router

define(['jquery', 'backbone'], function($, Backbone) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",
      "tickets/:id": "details",
    },

    // Paths
    index: function() {

      var TicketListView = new ticketer.views.tickets.index({ collection: ticketer.collections.tickets });

      // Transitions
      $('header').fadeOut('fast', function(){
        ticketer.views.headers.full.render();
      }).fadeIn('fast');

      $('#main').fadeOut('fast', function() {
        $(this).html(''); // clear
        TicketListView.render();
      }).fadeIn('fast');
    },

    details: function(id) {
      var ticket = ticketer.collections.tickets.get(id);
      var TicketDetailsView = new ticketer.views.tickets.show({ model: ticket });

      // Transitions
      $('header').fadeOut('fast', function(){
        ticketer.views.headers.back.render();
      }).fadeIn('fast');

      $('#main').fadeOut('fast', function() {
        $(this).html(''); // clear
        TicketDetailsView.render();
      }).fadeIn('fast');
    },


  });

  return Ticketer;
});