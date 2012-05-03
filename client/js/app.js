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
  'Sync',
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
  AppCache,
  Sync
) {

  $(function() {

    /* Begin AppCache Monitoring */
    new AppCache();

    /*
     * ticketer - our namespace object, create
     * the object and attach functions and models to it
     */
    window.ticketer = window.ticketer || {
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

    /**
     * Create new instances of alert views and start event bindings
     */
    ticketer.views.alerts = {
      error: new ErrorView(),
      alert: new AlertView(),
      notifications: new NotificationView()
    };

    /**
     * Initialize Socket Event Handlers
     */
    new SocketEvents();

    /**
     * Override the closedTicket collection's comparator
     */
    ticketer.collections.closedTickets.comparator = function(collection) {
      var datum = new Date(collection.get('closed_at'));
      var closed_at = datum.getTime();
      return -closed_at;
    };

    /**
     * Using Socket Authentication get the server-side
     * session info from the socket and set the currentUser
     * attribute. Bootstrap models over the socket by sending
     * a 'tickets:fetch' event.
     */
    ticketer.sockets.sock.on('session:info', function(message) {
      ticketer.currentUser = message.user;
      ticketer.sockets.id = ticketer.sockets.id || this.socket.sessionid;

      // Reset the admins collection
      ticketer.collections.admins.reset(message.admins);

      // Emit a `tickets:fetch` event to load ticket data
      ticketer.sockets.sock.emit('tickets:fetch');

      // Set Default User Avatar
      if (!ticketer.currentUser.avatar) ticketer.currentUser.avatar = "/img/avatars/65x65.gif";

      // Override Backbone Sync
      new Sync();

      // Start Backbone History
      try {
        Backbone.history.start();
      } catch (x) {}

      // Fetch the first page of closed tickets after the page history starts
      ticketer.collections.closedTickets.fetch({ data: { page: 1, status: 'closed' } });
    });


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

  });
});