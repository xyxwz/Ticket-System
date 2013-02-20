/**
 * Route
 *
 * Creates a route that an EventSource can attach to.
 *
 * Creates an app.sockets array that can be used to publish SSE to
 * connected clients.
 */

module.exports = function(app) {

  // Create an Array to hold open sockets
  app.sockets = [];

  app.get('/events', function(req, res, next) {

    if(!req.headers.accept || req.headers.accept !== 'text/event-stream') {
      return res.json({error: new Error("Must accept 'text/event-stream'")}, 500);
    }

    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive'
    });

    // generate a unique ID
    var id = new Date().getTime() + '-' + req.user._id;

    // Push the connection into a socket array
    app.sockets.push({ id: id, res: res, user: req.user });

    // Initial message with IE padding
    res.write(':' + Array(2049).join(' ') + '\n'); //2kb padding for IE
    res.write('retry: 2000\n');
    res.write('data: ' + Date() + '\n\n');

    // Send a Heartbeat every 10 seconds to detect disconnect
    var t = setInterval(function () {
      res.write('data: ' + Date() + '\n\n');
    }, 10000);

    // Remove the socket from the array when connection is closed
    req.on('close', function() {
      var _i, _len;

      for(_i = 0, _len = app.sockets.length; _i < _len; _i++) {
        if(app.sockets[_i].id === id) {
          app.sockets.splice(_i,1);
          break;
        }
      }
    });
  });

};