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
  'views/alerts/ErrorView',
  'views/alerts/AlertView',
  'views/alerts/NotificationView',
  'SocketEvents',
  'AppCache',
  'socket.io'
], function(
  _,
  Backbone,
  Tickets,
  Comments,
  Users,
  Ticketer,
  MainHeaderView,
  BackHeaderView,
  ErrorView,
  AlertView,
  NotificationView,
  SocketEvents,
  AppCache
) {

  $(function() {

    /* Begin AppCache Monitoring */
    new AppCache();

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
      views: {
        headers: {
          main: MainHeaderView,
          back: BackHeaderView
        }
      },
      sockets: {
        sock: io.connect()
      }
    };

    /**
     * Create a global namespaced event emitter to deal with
     * arbitrary backbone events.
     *
     * Events bound to this should always live and not need to be
     * unbound. It's useful for things like error messages and alerts.
     */

    ticketer.EventEmitter = {};
    _.extend(ticketer.EventEmitter, Backbone.Events);

    /**
     * Load Global Collections after EventEmitter
     */
    ticketer.collections = {
      openTickets: new Tickets(),
      closedTickets: new Tickets(),
      admins: new Users()
    };

    // Create new instances of alert views and start event bindings
    ticketer.views.alerts = {
      error: new ErrorView(),
      alert: new AlertView(),
      notifications: new NotificationView()
    };

    // On Connect set the socket id if not already set
    ticketer.sockets.sock.on('connect', function() {
      ticketer.sockets.id = ticketer.sockets.id || this.socket.sessionid;
      ticketer.sockets.sock.emit('set:user', currentUser.id);

      //Bootstrap models over socket
      ticketer.sockets.sock.emit('tickets:fetch');
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
    ticketer.collections.admins.reset(admins);

    // Start Backbone History
    Backbone.history.start();

    /* Check for Desktop Notification Support
     * and permissions. If supported and no permissions
     * request them.
     *
     * Set ticketer.notifications to true if they are enabled
     */
    if (webkitNotifications) {
      var status = webkitNotifications.checkPermission();
      if (status === 0) {
        ticketer.notifications = true;
      } else if(status === 2) {
        ticketer.notifications = false;
      } else {
        ticketer.views.alerts.notifications.render();
      }
    }

    /* Fetch the first page of closed tickets after the page is rendered */
    ticketer.collections.closedTickets.fetch({ data: { page: 1, status: 'closed' } });
  });
});