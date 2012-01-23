
module.exports = function (app) {
  var lib = {
    Authentication: require('./authentication')(app),

    middleware: {
      Auth: require('./middleware/authentication').Authenticate,
      Error: require('./middleware/error-handler').Error,
      AccessControl: require('./middleware/access_control').AccessControl
    }
  };

  return lib;
};
