/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'backbone',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'views/headers/FullHeader',
  'views/headers/Back',
  'views/tickets/TicketListView',
  'views/tickets/TicketDetailsView',
  'views/comments/CommentListView',
  'routers/Ticketer'
], function(
  Backbone,
  Tickets,
  Comments,
  Users,
  FullHeader,
  Back,
  TicketListView,
  TicketDetailsView,
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
        comments: new Comments(),
        users: new Users(),
      },
    };

    // Add top level views
    ticketer.views = {
      headers: {
        full: new FullHeader(),
        back: new Back(),
      },
      tickets: {
        index: TicketListView,
        show: TicketDetailsView,
      },
      comments: {
        index: CommentListView,
      },
    };

    ticketer.collections.tickets.reset(tickets);
    Backbone.history.start();
  });
});