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
      "tickets/search/:term": "searchTickets"
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
     * Default view
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

    searchTickets: function(term) {
      this.controller.searchTickets(term);
    }

  });

  return Ticketer;
});