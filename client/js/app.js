/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'backbone',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'views/headers/FullHeader',
  'views/tickets/TicketListView',
  'routers/Ticketer'
], function(
  Backbone,
  Tickets,
  Comments,
  Users,
  FullHeader,
  TicketListView,
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
        full: new FullHeader()
      },
      tickets: {
        index: new TicketListView({ collection: ticketer.collections.tickets })
      },
    };

    // Fetch Tickets
    ticketer.collections.tickets.fetch();

    Backbone.history.start();
  });
});