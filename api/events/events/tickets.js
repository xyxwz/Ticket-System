var _ = require('underscore'),
    notifications = require('../../models/helpers/notifications');

module.exports = function(app) {

  /**
   * Create Global Event Emitter Bindings
   */

  app.eventEmitter.on('ticket:new', function(obj) {
    processEvent(newTicket, obj);
  });

  app.eventEmitter.on('ticket:update', function(obj) {
    processEvent(updateTicket, obj);
  });

  app.eventEmitter.on('ticket:remove', function(obj) {
    processEvent(removeTicket, obj);
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

  var newTicket = function(socket, message) {
    _emitTicketAction(socket, message, 'ticket:new');
  };

  /**
   * Emit a resource update event
   */

  var updateTicket = function(socket, message) {
    _emitTicketAction(socket, message, 'ticket:update');
  };

  /**
   * Emit a resource remove event
   */

  var removeTicket = function (socket, message) {
    _sendSSE(socket.res, 'ticket:remove', message);
  };


  // Private Funtions

  var _emitTicketAction = function(socket, message, action) {
    _checkNotification(socket.user, message.body, message.body.id, function(err, ticket) {
      _sendSSE(socket.res, action, ticket);
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