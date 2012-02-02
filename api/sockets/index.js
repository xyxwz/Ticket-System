module.exports = function(app) {

  var sockets = {
    tickets: require('./tickets')(app)
  };

  return sockets;
};