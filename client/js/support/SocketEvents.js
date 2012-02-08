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

    /**
     * Binding for tickets:fetch, reset the collection
     * with the returned tickets.
     */

    ticketer.sockets.sock.on('tickets:fetch', function(err, tickets) {
      //Return an array of ticket models and bootstrap into tickets collection
      if(err) {
        ticketer.EventEmitter.trigger('error', err);
      }
      else {
        ticketer.collections.openTickets.reset(tickets);
      }
    });

    /**
     * Binding for a `comment:new` event
     */

    ticketer.sockets.sock.on('comment:new', function(message) {

      // trigger a `comment:new` event
      ticketer.EventEmitter.trigger('comment:new', message);

    });

    /**
     * Binding for a `comment:update` event
     */

    ticketer.sockets.sock.on('comment:update', function(message) {

      // trigger a `comment:update` event
      ticketer.EventEmitter.trigger('comment:update', message);

    });


    /*
     * Client side events -> socket events
     */

    ticketer.EventEmitter.on('ticket:notification:remove', function(ticket) {
      ticketer.sockets.sock.emit('ticket:notification:remove', ticket);
    });


  };

  return SocketEvents;
});
