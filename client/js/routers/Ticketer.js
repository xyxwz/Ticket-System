/**
 * Application Router
 */

define([
  'backbone',
  'views/headers/MainHeaderView',
  'support/PanelController'
],
function(Backbone, HeaderView, PanelController) {

  var Ticketer = Backbone.Router.extend({
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

    initialize: function(){
      // Create the Page Header
      var view = new HeaderView({router: this});
      $('header').append(view.render().el);

      this.controller = new PanelController();
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