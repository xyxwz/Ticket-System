module.exports = function requireControllers(app) {

  var controllers = {
    api: {
      users: require('./api/users')(app),
      tickets: require('./api/tickets')(app),
      comments: require('./api/comments')(app),
      projects: require('./api/projects')(app),
      lists: require('./api/lists')(app),
      notifications: require('./api/notifications')(app)
    },

    authentication: require('./authentication')(app),
    client: require('./static')(app)
  };

  return controllers;
};
