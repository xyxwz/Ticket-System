/**
 * Application Router
 */

define([
  'backbone',
  'views/headers/MainHeaderView'],
function(Backbone, HeaderView) {

  var Ticketer = Backbone.Router.extend({
    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/closed?*params": "closedTickets",
      "tickets/mine": "myTickets"
    },

    /**
     * Initialize our AppView function that manages main views
     * and toolbar swapping
     */

    initialize: function(){
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
      ticketer.controller.showOpenTickets();
    },

    closedTickets: function() {
      ticketer.controller.showClosedTickets();
    },

    myTickets: function() {
      ticketer.controller.showMyTickets();
    }

  });

  return Ticketer;
});