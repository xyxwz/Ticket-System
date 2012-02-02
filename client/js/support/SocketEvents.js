/* Handle Events Coming From Socket.io */

define(['underscore', 'backbone'], function(_, Backbone) {
  
  var SocketEvents = function() {

    var View = ticketer.routers.ticketer.appView;
    
    ticketer.sockets.tickets.on('new', function(model) {
      if(View.currentView.options.namespace || View.currentView.options.namespace === 'openTickets') {
        // We need to show a notification
      }
      else {
        // Just add the new ticket to the open tickets collection
        ticketer.collections.openTickets.add(model);
      }
    });

  };

  return SocketEvents;
});
