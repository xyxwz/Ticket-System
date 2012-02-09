var io = require('socket.io'),
    _ = require('underscore'),
    notifications = require('../models/helpers/notifications');

module.exports = function(app) {

  var sockets = [];

  /**
   * Create Global Event Emitter Bindings
   */

  app.eventEmitter.on('comment:new', function(obj) {
    processEvent('newComment', obj);
  });

  app.eventEmitter.on('comment:update', function(obj) {
    processEvent('updateComment', obj);
  });

  app.eventEmitter.on('comment:remove', function(obj) {
    processEvent('removeComment', obj);
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
     * Remove this socket from the array.
     * Similar to running an unbind
     */

    socket.on('disconnect', function() {
      var _i, _len;

      for(_i = 0, _len = sockets.length; _i < _len; _i++) {
        if(sockets[_i].id === socket.id) {
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

    var emitCommentAction = function (message, action) {
      var user = socket.get('user', function(err, user){
        checkNotification(user, message.body, message.ticket, function(err, msg) {
          msg.ticket = message.ticket;
          socket.emit(action, msg);
        });
      });
    };

    var checkNotification = function (user, obj, ticket, cb) {
      var _obj = _.clone(obj);

      notifications.isParticipating(app.redis, user, ticket, function(err, status) {
        if(err) return cb(err);
        if(status) _obj.participating = true;

        notifications.hasNotification(app.redis, user, ticket, function(err, notify) {
          if(err) return cb(err);
          if(notify) _obj.notification = true;
          return cb(null, _obj);
        });
      });
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

      newComment: function (message) {
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

      updateComment: function (message) {
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
      },

      /* Emit a resource remove event */

      removeComment: function (message) {
        socket.emit('comment:remove', message);
      }

    }; // close return

  }; // close socketModule

};