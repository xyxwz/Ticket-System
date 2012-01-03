/* FullHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone','garbage', 'text!templates/headers/MainHeader.html'],
function($, _, Backbone, BaseView, HeaderTmpl) {

  var BackHeadersView = BaseView.extend({

    events: {
      "click #createTicket"  : "navigateToForm",
      "click #myTickets"     : "toggleMyTickets",
      "click #openTickets"   : "toggleOpen",
      "click #closedTickets" : "toggleClosed",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(HeaderTmpl);
      return this;
    },

    navigateToForm: function() {
      ticketer.routers.ticketer.navigate("tickets/new", true);
    },

    toggleMyTickets: function() {
      // TODO
    },

    toggleOpen: function() {
      ticketer.routers.ticketer.navigate("tickets/open", true);
    },

    toggleClosed: function() {
      ticketer.routers.ticketer.navigate("tickets/closed", true);
    },

    /* Sets the correct highlighted state (.yellow) on
     * the selected tab. Checks that the tab isn't currently 
     * highlighted then clears out all highlights on the tabs 
     * and adds class to correct tab.
     *    :tab - a div ID to represent the desired page tab
     */
    toggleTab: function(tab) {
      if ($('#' + tab + ' .yellow', 'header').length === 0) {
        $('header li').removeClass('yellow');
        $('#' + tab, 'header').addClass('yellow');
      }
    },

  });

  return BackHeadersView;
 });