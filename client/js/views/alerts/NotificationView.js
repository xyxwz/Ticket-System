define([
  'jquery', 'underscore', 'backbone',
  'mustache', 'models/Ticket'
],
function($, _, Backbone, mustache, Ticket) {

  var NotificationView = Backbone.View.extend({
    initialize: function() {
      var self = this;

      // Just return if Notification is not supported
      if(typeof Notification === 'undefined') return;

      ticketer.EventEmitter.on('comment:new', this.commentNotification, this);
      ticketer.EventEmitter.on('ticket:update', this.closedNotification, this);

      // Notification.request permission must be invoked
      // after the first event on the page - this is a HACK
      if(Notification.permission === 'granted') {
        this.allowed = true;
      } else if(Notification.permission !== 'denied') {
        $('body').one('click', function() {
          self.requestPermission();
        });
      }
    },

    enabled: function() {
      var s = ticketer.currentUser.get('settings');

      return this.allowed && s.desktop;
    },

    requestPermission: function() {
      var self = this;

      Notification.requestPermission(function(permission) {
        if(permission === 'granted') {
          self.allowed = true;
        } else {
          self.allowed = false;
        }
      });
    },

    /**
     * Comment notification, renders a new comment notification
     *
     * @param {Object} message event data from the server
     */

    commentNotification: function(message) {
      var n, t, self = this,
          ticket = new Ticket({id: message.ticket});

      // Ensure notifications are enabled
      if(!this.enabled()) return;

      ticket.fetch({
        success: function() {
          if(ticket.get('status') === 'open' && message.notification) {
            t = message.user.name + ' has commented on "' + ticket.get('title') + '":';

            n = new Notification(t, {
              body: message.comment,
              icon: message.user.avatar
            });

            $(n).one('click', function() {
              ticketer.controller.showTicket(ticket);
            });
          }
        }
      });
    },

    /**
     * Closed notification, renders a closed ticket notification
     *
     * @param {Object} message event data from the server
     */


    closedNotification: function(message) {
      var n;

      // Ensure notifications are enabled
      if(!this.enabled()) return;

      if(message.status === 'closed') {
        // Check if the current user is the creator,
        // or is not assigned (the closer) and a participant
        if(message.user.id === ticketer.currentUser.id ||
          (!_.include(message.assigned_to, ticketer.currentUser.id) &&
            _.include(message.participants, ticketer.currentUser.id))) {

          n = new Notification('Ticket Closed', {
            icon: '/img/assets/closed_ticket.png',
            body: 'The following ticket has been closed: "' + message.title + '".'
          });
        }
      }
    }

  });

  return NotificationView;
});
