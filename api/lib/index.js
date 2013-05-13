
module.exports = function (app) {
  var lib = {
    Authentication: require('./authentication')(app),

    middleware: {
      Auth: require('./middleware/authentication').Authenticate,
      Error: require('./middleware/error-handler').Error,
      AccessControl: require('./middleware/access_control').AccessControl,
      CORS: require('./middleware/cors').Cors,
      SSE: require('./middleware/sse_auth').SSE
    }
  };

  return lib;
};
