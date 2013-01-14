var io = require('socket.io'),
    _ = require('underscore'),
    parseCookie = require('connect').utils.parseCookie,
    Session = require('connect').middleware.session.Session;

module.exports = function(app) {

  var User = app.models.User;

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

  /* Emit the session user object and admins on the
   * `connection` event so that the client can bootstrap the
   * data and the index page can be cached properly;
   */
  app.socket.sockets.on('connection', function(socket) {
    getUsers(function(err, models) {
      var data = {
        user: socket.handshake.session.passport.user,
        users: models
      };

      socket.emit('session:info', data);
    });

  });

  function getUsers(cb) {
    User.all(function(err, models) {
      if(err) return cb('error getting users');
      return cb(null, models);
    });
  }

  function getAdmins(cb) {
    User.admins(function(err, models) {
      if(err) return cb('error getting admins');
      return cb(null, models);
    });
  }

};