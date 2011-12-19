module.exports = function(app){
  require('./api/users.js')(app);
  require('./api/tickets.js')(app);
  require('./api/comments.js')(app);
  require('./api/static.js')(app);
}
