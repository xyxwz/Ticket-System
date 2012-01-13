/* TxSSC Ticketer - An IT support ticket system
   http://txssc.txstate.edu
 */

define([
  'underscore',
  'backbone',
  'collections/Tickets',
  'collections/MyTickets',
  'collections/Comments',
  'collections/Users',
  'routers/Ticketer',
  'views/headers/MainHeaderView',
  'views/headers/BackHeaderView'
], function(
  _,
  Backbone,
  Tickets,
  MyTickets,
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
        myTickets: new MyTickets(),
        admins: new Users(),
      },
      views: {
        headers: {
          main: MainHeaderView,
          back: BackHeaderView,
        }
      },
      models: [],
    };

    /* Override the closedTicket collection's comparator
     *
     * MongoDB id's are 12-byte values with the first 4 bytes
     * being a UNIX style timestamp. If we turn the hex into a
     * integer and negate it we can reverse the sort order.
     */
    ticketer.collections.closedTickets.comparator = function(collection) {
      var id = collection.get("id");
      return -parseInt(id.substring(0,8), 16);
    };

    /* Reset collections with bootstrapped data.
     * Reads in JSON variables written to page by server
     * side code to prevent fetch at boot and make collections
     * available immediately to views. */
    ticketer.collections.openTickets.reset(openTickets);
    ticketer.collections.myTickets.reset(myTickets);
    ticketer.collections.closedTickets.reset(closedTickets);
    ticketer.collections.admins.reset(admins);

    // Start Backbone History
    Backbone.history.start();
  });
});