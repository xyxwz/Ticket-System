var io = require('socket.io'),
    notifications = require('../models/helpers/notifications');

module.exports = function(app) {

  var Ticket = require('../models')(app).Ticket;

  var sockets = [];

  /**
   * Create Global Event Emitter Bindings
   */

  app.eventEmitter.on('ticket:new', function(obj) {
    processEvent('newTicket', obj);
  });

  app.eventEmitter.on('ticket:update', function(obj) {
    processEvent('updateTicket', obj);
  });

  app.eventEmitter.on('ticket:remove', function(obj) {
    processEvent('removeTicket', obj);
  });

  /**
   * Utility Function to run a function on each of the
   * socket's module object.
   */

  function processEvent(fn, obj) {
    var _i, _len;

    for(_i = 0, _len = sockets.length; _i < _len; _i++) {
      var res = sockets[_i].module[fn](obj);
    }
  }


  /**
   * Establish a new socket connection and create socket bindings
   */

  app.socket.sockets.on('connection', function(socket) {

    var module = new socketModule(socket);
    sockets.push({ id: socket.id, module: module });

    // Set the socket user id
    socket.on('set:user', function(user) {
      socket.set('user', user);
    });

    /**
     * Bind to the ticket:fetch client event
     * and send all tickets to the client
     */

    socket.on('tickets:fetch', module.getTickets);

    /**
     * Remove the notification for the user
     */
    socket.on('ticket:notification:remove', module.removeNotification);
    socket.on('ticket:notifications:clear', module.clearNotifications);

    /**
     * Remove this socket from the array.
     * Similar to running an unbind
     */

    socket.on('disconnect', function() {
      var _i, _len;

      for(_i = 0, _len = sockets.length; _i < _len; _i++) {
        if(sockets[_i]['id'] === socket.id) {
          sockets.splice(_i,1);
          break;
        }
      }
    });

  });


  /**
   * Socket Module
   *
   * Contains the logic for emitting events through the
   * socket and handling things such as notifications.
   */

  var socketModule = function(socket) {

    // Private Funtions

    var emitTicketAction = function(message, action) {
      var user = socket.get('user', function(err, user){
        checkNotification(user, message.body, message.body.id, function(err, ticket) {
          socket.emit(action, ticket);
        });
      });
    };

    var checkNotification = function (user, obj, ticket, cb) {
      notifications.isParticipating(app.redis, user, ticket, function(err, status) {
        if(err) return cb(err);
        if(status) obj.participating = true;

        notifications.hasNotification(app.redis, user, ticket, function(err, notify) {
          if(err) return cb(err);
          if(notify) obj.notification = true;
          return cb(null, obj);
        });
      });
    };

    var getAllTickets = function (user) {
      var _i, _len, _ret = [];

      Ticket.all({ status: 'open' }, function(err, tickets) {
        if(err) return ccb(err);

        for(_i = 0, _len = tickets.length; _i < _len; _i++) {
          setArray(tickets[_i]);
        }
      });

      function setArray(ticket) {
        checkNotification(user, ticket, ticket.id, function(err, model) {
          if(err) return socket.emit('tickets:fetch', err);

          _ret.push(model);
          if(_ret.length === _len) {
            return socket.emit('tickets:fetch', null, _ret);
          }
        });
      }
    };


    // Public Functions

    return {

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

      newTicket: function (message) {
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
      },

      /**
       * Emit a resource update event
       *
       * If a resource is updated we want to push down the changes to
       * all the connected sockets.
       *
       * We also want to notify a user if they are participating in
       * that ticket so they can see changes have occured.
       */

      updateTicket: function (message) {
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
      },

      /* Emit a resource remove event */

      removeTicket: function (id) {
        socket.emit('ticket:remove', id);
      },

      /*
       * Get all tickets and return them to the client
       * :emits tickets:fetch event with an error, and or tickets
       */

      getTickets: function () {
        socket.get('user', function(err, user) {
          getAllTickets(user);
        });
      },

      /**
       * Remove the notification for the user
       */

      removeNotification: function (ticket) {
        socket.get('user', function(err, user) {
          notifications.removeNotification(app.redis, user, ticket, function(err, status) {
            if(err) return socket.emit('ticket:notification:error', err);
          });
        });
      },

      /**
       * Clear the user's notifications
       */

      clearNotifications: function () {
        socket.get('user', function(err, user) {
          notifications.clearNotifications(app.redis, user, function(err, status) {
            if(err) return socket.emit('ticket:notification:error', err);
          });
        });
      }

    }; // close return

  }; // close socketModule

};