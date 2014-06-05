define([
  'backbone',
  'views/headers/MainHeaderView'
], function(Backbone, HeaderView) {
  var Ticketer;

  /**
   * Application Router
   */

  Ticketer = Backbone.Router.extend({
    routes: {
      "": "index",
      "tickets/open": "openTickets",
      "tickets/closed": "closedTickets",
      "tickets/mine": "myTickets",
      "tickets/:tickets/:term": "searchTickets"
    },

    /**
     * Initialize our AppView function that manages main views
     * and toolbar swapping
     */

    initialize: function(options) {
      options = options || {};
      this.controller = options.controller;

      // Add page header
      $('header').append(new HeaderView({ router: this }).render().el);
      this.controller._setHeight();
    },

    /**
     * Return string indicating the current route
     */

    getRoute: function() {
      return Backbone.history.fragment;
    },

    /**
     * Route handlers
     */

    index: function() {
      this.navigate("tickets/mine", true);
    },

    openTickets: function() {
      this.controller.showOpenTickets();
    },

    closedTickets: function() {
      this.controller.showClosedTickets();
    },

    myTickets: function() {
      this.controller.showMyTickets();
    },

    searchTickets: function(status, term) {
      this.controller.searchTickets(status, term);
    }
  });

  return Ticketer;
});
