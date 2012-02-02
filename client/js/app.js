/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'underscore',
  'backbone',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'routers/Ticketer',
  'views/headers/MainHeaderView',
  'views/headers/BackHeaderView',
  'SocketEvents',
  'socket.io'
], function(
  _,
  Backbone,
  Tickets,
  Comments,
  Users,
  Ticketer,
  MainHeaderView,
  BackHeaderView
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
        admins: new Users()
      },
      views: {
        headers: {
          main: MainHeaderView,
          back: BackHeaderView
        }
      },
      sockets: {
        tickets: io.connect('/tickets')
      }
    };

    // On Connect set the socket id if not already set
    ticketer.sockets.tickets.on('connect', function() {
      ticketer.sockets.id = ticketer.sockets.id || this.socket.sessionid;
    });

    // Initialize Socket Event Handlers
    new SocketEvents();

    /* Set Default User Avatar */
    if (!ticketer.currentUser.avatar) ticketer.currentUser.avatar = "/img/avatars/65x65.gif";

    /* Override the closedTicket collection's comparator */
    ticketer.collections.closedTickets.comparator = function(collection) {
      var datum = new Date(collection.get('closed_at'));
      var closed_at = datum.getTime();
      return -closed_at;
    };

    /* Reset collections with bootstrapped data.
     * Reads in JSON variables written to page by server
     * side code to prevent fetch at boot and make collections
     * available immediately to views. */
    ticketer.collections.openTickets.reset(tickets);
    ticketer.collections.admins.reset(admins);

    // Start Backbone History
    Backbone.history.start();
  });
});