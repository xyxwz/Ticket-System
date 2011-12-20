module.exports = function(app){
  require('./helpers/pre-conditions.js')(app);
  require('./api/users.js')(app);
  require('./api/tickets.js')(app);
  require('./api/comments.js')(app);
  require('./api/static.js')(app);
}
