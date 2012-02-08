module.exports = function(app) {

  var sockets = {
    tickets: require('./tickets')(app),
    comments: require('./comments')(app)
  };

  return sockets;
};