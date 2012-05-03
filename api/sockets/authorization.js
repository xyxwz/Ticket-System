var io = require('socket.io'),
    _ = require('underscore'),
    parseCookie = require('connect').utils.parseCookie,
    Session = require('connect').middleware.session.Session;

module.exports = function(app) {

  app.socket.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
      data.cookie = parseCookie(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'];

      // Get the session data from the session store
      app.sessionStore.get(data.sessionID, function(err, session) {
        if (err || !session) {
          // if we cannot grab a session, turn down the connection
          accept('Error', false);
        } else {
          // create a session object, passing data as request and
          // the just acquired session data
          data.session = new Session(data, session);
          accept(null, true);
        }
      });
    } else {
     return accept('No cookie transmitted.', false);
    }
  });

  // Emit the session user object through the socket
  app.socket.sockets.on('connection', function(socket) {
    var hs = socket.handshake;
    socket.emit('session:info', hs.session.passport.user);
  });

};