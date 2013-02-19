/**
 * TxSSC Ticketer - An IT support ticket system
 * http://txssc.txstate.edu
 *
 * The main entry point to the `ticketer` application
 */

define([
  'underscore',
  'backbone',
  'support/PanelController',
  'collections/Tickets',
  'collections/Comments',
  'collections/Users',
  'collections/Projects',
  'collections/Lists',
  'routers/Ticketer',
  'views/alerts/ErrorView',
  'views/alerts/NotificationView',
  'EventSource',
  'ServerEvents',
  'AppCache',
  'Sync'
], function(
  _,
  Backbone,
  PanelController,
  Tickets,
  Comments,
  Users,
  Projects,
  Lists,
  Ticketer,
  ErrorView,
  NotificationView,
  EventSource,
  ServerEvents,
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
    window.ticketer = window.ticketer || {};

    /**
     * Set Color Array on Ticketer Object
     */

    ticketer.colors = [
      { value: 0, name: 'lightOrange' },
      { value: 1, name: 'blue' },
      { value: 2, name: 'red' },
      { value: 3, name: 'green' },
      { value: 4, name: 'teal' },
      { value: 5, name: 'pink' },
      { value: 6, name: 'brightGreen' },
      { value: 7, name: 'tan' }
    ];

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
      users: new Users(),
      lists: new Lists()
    };

    ticketer.routers = {
      ticketer: new Ticketer()
    };

    /**
     * Create new instances of alert views and start event bindings
     */
    ticketer.views = {
      alerts: {
        error: new ErrorView(),
        notifications: new NotificationView()
      }
    };

    // Override Backbone Sync
    new Sync();

    /**
     * Initialize an EventSource listener
     */
    ticketer.SSE = new EventSource('/events', { withCredentials: true });
    new ServerEvents();

    // Fetch projects and lists
    ticketer.collections.lists.fetch();

    // Fetch Users
    ticketer.collections.users.fetch();

    // Fetch open tickets
    ticketer.collections.openTickets.fetch({
      data: { status: 'open' }
    });

    // Start Backbone History
    try {
      Backbone.history.start();
    } catch (x) {}

    /**
     * Bind `ESCAPE` to remove all dialogs
     */

    $('body').keyup(function(e) {
      if(e.keyCode === 27) {
        $('body .dialog').remove();
      }
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