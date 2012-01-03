/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'underscore',
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
  'views/tickets/TicketFormView',
  'views/comments/CommentView',
  'views/comments/CommentListView',
  'views/comments/CommentFormView',
  'routers/Ticketer'
], function(
  _,
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
  TicketFormView,
  CommentView,
  CommentListView,
  CommentFormView,
  Ticketer
) {

  $(function() {

    /* Override Backbone Sync Method
     * includes an X-Auth-Token and Accept Header
     */
    Backbone.sync_model = Backbone.sync;
    Backbone.sync = function(method, model, options) {

      var new_options = _.extend({

        beforeSend: function(xhr) {

          // Get the authentication token from the page
          var auth_token = $('meta[name="X-Auth-Token"]').attr('content');
          if (auth_token) {
            xhr.setRequestHeader('X-Auth-Token', auth_token);
          }
          // Add Accept Header for API
          xhr.setRequestHeader('Accept', 'application/json');
        }
      }, options);

      Backbone.sync_model(method, model, new_options);
    };


    /*
     * ticketer - our namespace object, create
     * the object and attach functions and models to it
     */
    window.ticketer = window.ticketer || {
      currentUser: currentUser, // set current user
      routers: {
        ticketer: new Ticketer()
      },
      collections: {
        openTickets: new Tickets(),
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
          form: TicketFormView,
        },
        comments: {
          comment: CommentView,
          index: CommentListView,
          form: CommentFormView,
        },
      },
    };

    /* Override the closedTicket collection's comparator to
     * sort by closed_at date instead of opened_at
     */
    ticketer.collections.closedTickets.comparator = function(collection) {
      return -collection.get("closed_at");
    };

    /* Reset collections with bootstrapped data.
     * Reads in JSON variables written to page by server
     * side code to prevent fetch at boot and make collections
     * available immediately to views. */
    ticketer.collections.openTickets.reset(openTickets);
    ticketer.collections.closedTickets.reset(closedTickets);

    // Start Backbone History
    Backbone.history.start();
  });
});