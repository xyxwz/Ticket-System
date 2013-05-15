module.exports = function(app) {

  var events = {
    route: require('./events/route')(app),
    tickets: require('./events/tickets')(app),
    comments: require('./events/comments')(app)
  };

  return events;
};