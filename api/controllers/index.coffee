module.exports = (app) ->
  require('./api/users.coffee')(app)
  require('./api/tickets.coffee')(app)
  require('./api/comments.coffee')(app)