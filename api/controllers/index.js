module.exports = function requireControllers(app) {
  return {
    client: require("./static")(app),
    authentication: require("./authentication")(app),

    api: {
      lists: require('./api/lists')(app),
      users: require('./api/users')(app),
      tickets: require('./api/tickets')(app),
      comments: require('./api/comments')(app),
      projects: require('./api/projects')(app),
      notifications: require('./api/notifications')(app)
    }
  };
};