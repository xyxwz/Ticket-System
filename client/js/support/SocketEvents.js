/* Handle Events Coming From Socket.io */

define(['underscore', 'backbone'], function(_, Backbone) {
  
  var SocketEvents = function() {

    var View = ticketer.routers.ticketer.appView;
    
    ticketer.sockets.tickets.on('new', function(model) {

      // Trigger a `ticket` event
      ticketer.EventEmitter.trigger('ticket', model);

      // Add the new ticket to the openTickets collection
      ticketer.collections.openTickets.add(model);
    });

  };

  return SocketEvents;
});
