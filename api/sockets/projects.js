var io = require('socket.io'),
    _ = require('underscore');

module.exports = function(app) {

  var sockets = [];

  /**
   * Create Global Event Emitter Bindings
   */

  app.eventEmitter.on('project:new', function(obj) {
    processEvent('newProject', obj);
  });

  app.eventEmitter.on('project:update', function(obj) {
    processEvent('updateProject', obj);
  });

  app.eventEmitter.on('project:remove', function(obj) {
    processEvent('removeProject', obj);
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
   */

  var socketModule = function(socket) {

    return {

     /**
      * Broadcast a new resource to all connected sockets.
      */

      newProject: function (obj) {
        socket.emit('project:new', obj);
      },

      /**
       * Emit a resource update event
       *
       * If a resource is updated we want to push down the changes to
       * all the connected sockets.
       */

      updateProject: function (obj) {
        socket.emit('project:update', obj);
      },

      /* Emit a resource remove event */

      removeProject: function (obj) {
        socket.emit('project:remove', obj);
      }

    };

  }; // close socketModule

};