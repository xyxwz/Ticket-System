/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'backbone',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/ClosedTicketListView',
  'views/comments/CommentListView',
  'routers/Ticketer'
], function(
  Backbone,
  Tickets,
  Comments,
  Users,
  TicketListView,
  TicketDetailsView,
  ClosedTicketListView,
  CommentListView,
  Ticketer
) {

  $(function() {

    /*
     * ticketer - our namespace object, create
     * the object and attach functions and models to it
     */
    window.ticketer = window.ticketer || {
      routers: {
        ticketer: new Ticketer()
      },
      collections: {
        tickets: new Tickets(),
        closedTickets: new Tickets(),
        comments: new Comments(),
        users: new Users(),
      },
    };

    // Add top level views
    ticketer.views = {
      tickets: {
        index: TicketListView,
        show: TicketDetailsView,
        closed: ClosedTicketListView,
      },
      comments: {
        index: CommentListView,
      },
    };

    /* Reset collections with bootstrapped data.
     * Reads in JSON variables written to page by server
     * side code to prevent fetch at boot and make collections
     * available immediately to views. */
    ticketer.collections.tickets.reset(openTickets);
    ticketer.collections.closedTickets.reset(closedTickets);

    // Start Backbone History
    Backbone.history.start();
  });
});