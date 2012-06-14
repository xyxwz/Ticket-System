module.exports = function(app) {

  var sockets = {
    authorization: require('./authorization')(app),
    tickets: require('./tickets')(app),
    comments: require('./comments')(app),
    projects: require('./projects')(app)
  };

  return sockets;
};