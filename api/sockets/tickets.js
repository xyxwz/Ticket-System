var redis = require('redis'),
    io = require('socket.io');

module.exports = function(app) {

  app.socket.sockets.on('connection', function(socket) {

    /**
     * Bind to the eventEmitter's newTicket action and
     * run the sendTicket function
     */

    app.eventEmitter.on('newTicket', sendMessage);

    socket.on('disconnect', function() {
      app.eventEmitter.removeListener('newTicket', sendMessage);
    });


    function sendMessage(message) {
      if(message.socket) {
        // This ticket originated from a browser
        if(message.socket === socket.id) {
          // message originated from this client so broadcast to everyone else
          socket.broadcast.emit(message.action, message.body);
        }
      }
      else {
        // message originated from other api source so emit
        socket.emit(message.action, message.body);
      }
    }

  });

};