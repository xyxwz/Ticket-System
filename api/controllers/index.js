module.exports = function(app) {
  require('./helpers/pre-conditions.js')(app);
  require('./authentication.js')(app);
  require('./api/users.js')(app);
  require('./api/tickets.js')(app);
  require('./api/comments.js')(app);
  require('./static.js')(app);
}
