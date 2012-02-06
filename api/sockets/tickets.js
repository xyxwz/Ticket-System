var io = require('socket.io'),
    notifications = require('../models/helpers/notifications');

module.exports = function(app) {

  app.socket.sockets.on('connection', function(socket) {

    /**
     * Set the socket user id
     */

    socket.on('set:user', function(user) {
      socket.set('user', user);
    });

    /**
     * Bind to the eventEmitter events
     */

    app.eventEmitter.on('ticket:new', newTicket);
    app.eventEmitter.on('ticket:update', updateTicket);

    socket.on('disconnect', function() {
      //app.eventEmitter.removeListener('newTicket', sendMessage);
    });

    /**
     * Broadcast a new ticket to all connected sockets.
     *
     * Checks to see if the message has a socket attribute
     * to determine if the event originated from a connected
     * client or not. If so the message needs to be broadcast
     * from that socket so that the user doesn't end up with
     * multiple tickets.
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

    /**
     * Emit a ticket update event
     *
     * If a ticket is updated we want to push down the changes to
     * all the connected sockets.
     *
     * We also want to notify a user if they are participating in
     * that ticket so they can see changes have occured.
     */

    function updateTicket(message) {
      console.log(message);
      if(message.socket) {
        // This ticket originated from a browser
        if(message.socket !== socket.id) {

          // Only emit to other users
          emitTicketUpdate(message);
        }
      }
      else {
        // Update originated from elsewhere so emit to everyone
        emitTicketUpdate(message);
      }
    }

    function checkNotification(user, ticket, cb) {
      notifications.hasNotification(app.redis, user, ticket.id, function(err, notify) {
        if(err) return cb(err);
        if(notify) ticket.notification = true;
        return cb(null, ticket);
      });
    }

    function emitTicketUpdate(message) {
      var user = socket.get('user', function(err, user){
        checkNotification(user, message.body, function(err, ticket) {
          socket.emit('ticket:update', ticket);
        });
      });
    }

  });

};