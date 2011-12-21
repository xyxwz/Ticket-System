exports.Authentication = require('./authentication');

exports.middleware = {
  Auth: require('./middleware/authentication').Authenticate,
  Error: require('./middleware/error-handler').Error,
}

exports.settings = require('./settings')