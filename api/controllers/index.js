module.exports = function requireControllers(app){
  var controllers = {};

  controllers.helpers = {
    preCond: require('./helpers/pre-conditions')(app),
  }

  controllers.api = {
    users: require('./api/users')(app),
    tickets: require('./api/tickets')(app),
    comments: require('./api/comments')(app),
  }

  controllers.authentication = require('./authentication')(app);
  controllers.client = require('./static')(app);

  return controllers;
}
