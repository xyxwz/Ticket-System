/* Handle Events Coming From Socket.io */

define(['underscore', 'backbone'], function(_, Backbone) {
  
  var SocketEvents = function() {

    /**
     * Binding for a `ticket:new` event
     */
    
    ticketer.sockets.sock.on('ticket:new', function(model) {

      // Trigger a `ticket` event
      ticketer.EventEmitter.trigger('ticket:new', model);

      // Add the new ticket to the openTickets collection
      ticketer.collections.openTickets.add(model);
    });

    /**
     * Binding for a `ticket:update` event
     */

    ticketer.sockets.sock.on('ticket:update', function(model) {

      // trigger a `ticket:update` event
      ticketer.EventEmitter.trigger('ticket:update', model);

    });

  };

  return SocketEvents;
});
