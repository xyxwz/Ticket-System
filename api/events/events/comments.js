var _ = require('underscore'),
    notifications = require('../../models/helpers/notifications');

module.exports = function(app) {

  /**
   * Create Global Event Emitter Bindings
   */

  app.eventEmitter.on('comment:new', function(obj) {
    processEvent(newComment, obj);
  });

  app.eventEmitter.on('comment:update', function(obj) {
    processEvent(updateComment, obj);
  });

  app.eventEmitter.on('comment:remove', function(obj) {
    processEvent(removeComment, obj);
  });

  function processEvent(fn, obj) {
    var _i, _len;

    for(_i = 0, _len = app.sockets.length; _i < _len; _i++) {
      fn.call(null, app.sockets[_i], obj);
    }
  }

 /**
  * Broadcast a new resource to all connected sockets.
  */

  var newComment = function(socket, message) {
    _emitAction(socket, message, 'comment:new');
  };

  /**
   * Emit a resource update event
   */

  var updateComment = function(socket, message) {
    _emitAction(socket, message, 'comment:update');
  };

  /**
   * Emit a resource remove event
   */

  var removeComment = function (socket, message) {
    _sendSSE(socket.res, 'comment:remove', message);
  };


  // Private Funtions

  var _emitAction = function(socket, message, action) {
    _checkNotification(socket.user, message.body, message.ticket, function(err, msg) {
      msg.ticket = message.ticket;
      _sendSSE(socket.res, action, msg);
    });
  };

  var _checkNotification = function (user, obj, ticket, cb) {
    var _obj = _.clone(obj);

    notifications.isParticipating(app.redis, user._id, ticket, function(err, status) {
      if(err) return cb(err);
      _obj.participating = status;

      notifications.hasNotification(app.redis, user._id, ticket, function(err, notify) {
        if(err) return cb(err);
        _obj.notification = notify;
        return cb(null, _obj);
      });
    });
  };

  /**
   * Send an SSE to all connected sockets
   */

  var _sendSSE = function(res, event, message) {
    res.write('id: ' + new Date().getMilliseconds() + '\n');
    res.write('event: ' + event + '\n');
    res.write('data: ' + JSON.stringify(message) + '\n\n');
  };
};