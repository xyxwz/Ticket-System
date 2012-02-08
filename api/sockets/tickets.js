var io = require('socket.io'),
    notifications = require('../models/helpers/notifications');

module.exports = function(app) {

  var Ticket = require('../models')(app).Ticket;

  app.socket.sockets.on('connection', function(socket) {

    /**
     * Set the socket user id
     */

    socket.on('set:user', function(user) {
      socket.set('user', user);
    });

    /**
     * Bind to the ticket:fetch client event
     * and send all tickets to the client
     */
    socket.on('tickets:fetch', getTickets);

    /**
     * Remove the notification for the user
     */
    socket.on('ticket:notification:remove', removeNotification);
    socket.on('ticket:notifications:clear', clearNotifications);


    /**
     * Bind to the eventEmitter events
     */

    app.eventEmitter.on('ticket:new', newTicket);
    app.eventEmitter.on('ticket:update', updateTicket);
    app.eventEmitter.on('comment:new', newComment);
    app.eventEmitter.on('comment:update', updateComment);
    app.eventEmitter.on('comment:remove', removeComment);


    socket.on('disconnect', function() {
      //app.eventEmitter.removeListener('newTicket', sendMessage);
    });

    /**
     * Broadcast a new resource to all connected sockets.
     *
     * Checks to see if the message has a socket attribute
     * to determine if the event originated from a connected
     * client or not. If so the message needs to be broadcast
     * from that socket so that the user doesn't end up with
     * multiple items.
     *
     * If the message originated from another source through the api then
     * the message can just be emitted.
     */

    function newTicket(message) {
      if(message.socket) {
        // This ticket originated from a browser
        if(message.socket === socket.id) {
          // message originated from this client so broadcast to everyone else
          socket.broadcast.emit('ticket:new', message.body);
        }
      }
      else {
        // message originated from other api source so emit
        socket.emit('ticket:new', message.body);
      }
    }

    function newComment(message) {
      if(message.socket) {
        // This comment originated from a browser
        if(message.socket !== socket.id) {

          // Only emit to other users
          emitCommentAction(message, 'comment:new');
        }
      }
      else {
        // Update originated from elsewhere so emit to everyone
        emitCommentAction(message, 'comment:new');
      }
    }

    /**
     * Emit a resource update event
     *
     * If a resource is updated we want to push down the changes to
     * all the connected sockets.
     *
     * We also want to notify a user if they are participating in
     * that ticket so they can see changes have occured.
     */

    function updateTicket(message) {
      if(message.socket) {
        // This ticket originated from a browser
        if(message.socket !== socket.id) {

          // Only emit to other users
          emitTicketAction(message, 'ticket:update');
        }
      }
      else {
        // Update originated from elsewhere so emit to everyone
        emitTicketAction(message, 'ticket:update');
      }
    }

    function updateComment(message) {
      if(message.socket) {
        // This resource originated from a browser
        if(message.socket !== socket.id) {

          // Only emit to other users
          emitCommentAction(message, 'comment:update');
        }
      }
      else {
        // Update originated from elsewhere so emit to everyone
        emitCommentAction(message, 'comment:update');
      }
    }

    /** Emit a resource remove event
     *
     */

    function removeComment(id) {
      socket.emit('comment:remove', id);
    }

    /**
     * Emit Action Helpers
     *
     * Appends a notification flag if the user is participating
     * in the ticket.
     */

    function emitTicketAction(message, action) {
      var user = socket.get('user', function(err, user){
        checkNotification(user, message.body, message.body.id, function(err, ticket) {
          socket.emit(action, ticket);
        });
      });
    }

    function emitCommentAction(message, action) {
       var user = socket.get('user', function(err, user){
        checkNotification(user, message.body, message.ticket, function(err, msg) {
          msg.ticket = message.ticket;
          socket.emit(action, msg);
        });
      });
    }

    function checkNotification(user, obj, ticket, cb) {
      notifications.isParticipating(app.redis, user, ticket, function(err, status) {
        if(err) return cb(err);
        if(status) obj.participating = true;

        notifications.hasNotification(app.redis, user, ticket, function(err, notify) {
          if(err) return cb(err);
          if(notify) obj.notification = true;
          return cb(null, obj);
        });
      });
    }


    /*
     * Get all tickets and return them to the client
     * :emits tickets:fetch event with an error, and or tickets
     */

    function getTickets() {
      var i,
          length,
          ret = [];

      socket.get('user', function(err, user) {
        Ticket.all({ status: 'open' }, function(err, tickets) {
          if(err) return ccb(err);

          length = tickets.length;
          for(i = 0; i < length; i++) {
            checkNotification(user, tickets[i], tickets[i].id, function(err, ticket) {
              if(err) return socket.emit('tickets:fetch', err);
              ret.push(ticket);
              if(ret.length === length) {
                return socket.emit('tickets:fetch', null, ret);
              }
            });
          }
        });
      });
    }

    /**
     * Remove the notification for the user
     */

    function removeNotification(ticket) {
      socket.get('user', function(err, user) {
        notifications.removeNotification(app.redis, user, ticket, function(err, status) {
          if(err) return socket.emit('ticket:notification:error', err);
        });
      });
    }

    /**
     * Clear the user's notifications
     */

    function clearNotifications() {
      socket.get('user', function(err, user) {
        notifications.clearNotifications(app.redis, user, function(err, status) {
          if(err) return socket.emit('ticket:notification:error', err);
        });
      });
    }

  });

};