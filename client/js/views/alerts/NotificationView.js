define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/alerts/Notification.html'],
function($, _, Backbone, mustache, NotificationTmpl) {

  var NotificationView = Backbone.View.extend({

    id: "notification",
    className: "clearfix",
    tagName: "div",

    events: {
      "click button": "requestPermissions"
    },

    initialize: function() {
      _.bindAll(this);
      ticketer.EventEmitter.on('comment:new', this.commentNotification);
      ticketer.EventEmitter.on('ticket:update', this.closedNotification);
    },

    render: function() {
      $(this.el).html(Mustache.to_html(NotificationTmpl, {})).hide();
      $('body').prepend(this.el);
      $(this.el).slideDown(200);
    },

    requestPermissions: function() {
      $(this.el).hide();
      var self = this;
      webkitNotifications.requestPermission(self.requestCallback);
    },

    requestCallback: function() {
      var status = webkitNotifications.checkPermission();
      if (status === 0) {
        ticketer.notifications = true;
      } else {
        ticketer.notifications = false;
      }
    },

    /* When a comment is added to a ticket the user is participating
     * in, send a desktop notification if enabled.
     */
    commentNotification: function(message) {
      // Look up the ticket in the various collections
      var ticket = ticketer.collections.openTickets.get(message.ticket) ||
                   ticketer.collections.closedTickets.get(message.ticket);

      // ticket exists
      if(ticket) {
        // Fire a notification if the user is participating
        // and has notifications enabled
        if(ticketer.notifications && message.participating) {
          var title = message.user.name + ' made a comment on "' + ticket.get('title') + '":';
          webkitNotifications.createNotification('', title, message.comment).show();
        }
      }
    },

    /* When a ticket is closed, send the creator and the people assigned
     * to the ticket a desktop notification if enabled.
     */
    closedNotification: function(message) {
      if(!ticketer.notifications) { return false; }

      if(message.status === 'closed') {
        var title = "Ticket Closed";
        // Check if currentUser is assigned or the creator
        // if so, send a desktop notification
        if(message.user.id === ticketer.currentUser.id) {
          webkitNotifications.createNotification('', title, message.title).show();
        } else if(message.assigned_to.length > 0) {
          var assignedTo = _.include(message.assigned_to, ticketer.currentUser.id);
          if(assignedTo) { webkitNotifications.createNotification('', title, message.title).show(); }
        }
      }
    }

  });

  return NotificationView;
});