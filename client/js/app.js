/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'backbone',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'views/headers/MainHeaderView',
  'views/headers/BackHeaderView',
  'views/tickets/TicketView',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/tickets/ClosedTicketListView',
  'views/comments/CommentView',
  'views/comments/CommentListView',
  'views/comments/CommentFormView',
  'routers/Ticketer'
], function(
  Backbone,
  Tickets,
  Comments,
  Users,
  MainHeaderView,
  BackHeaderView,
  TicketView,
  TicketListView,
  TicketDetailsView,
  ClosedTicketListView,
  CommentView,
  CommentListView,
  CommentFormView,
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
        users: new Users(),
      },
      views: {
        headers: {
          main: MainHeaderView,
          back: BackHeaderView,
        },
        tickets: {
          ticket: TicketView,
          index: TicketListView,
          show: TicketDetailsView,
          closed: ClosedTicketListView,
        },
        comments: {
          comment: CommentView,
          index: CommentListView,
          form: CommentFormView,
        },
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