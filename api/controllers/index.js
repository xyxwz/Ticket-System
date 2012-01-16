module.exports = function requireControllers(app){
  var controllers = {
    helpers: {
      preCond: require('./helpers/pre-conditions')(app),
    },

    api: {
      users: require('./api/users')(app),
      tickets: require('./api/tickets')(app),
      comments: require('./api/comments')(app),
    },

    authentication: require('./authentication')(app),
    client: require('./static')(app),
  };

  return controllers;
}
