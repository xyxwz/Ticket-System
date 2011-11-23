mongoose = require 'mongoose'
User = mongoose.model 'User'
_ = require 'underscore'

module.exports = (app) ->

  # Get all users
  app.get '/users.json', (req, res) ->
    User
    .find()
    .run (err, users) ->
      array = []
      _.each users, (user) ->
        obj = user.toClient()
        array.push(obj)

      res.send JSON.stringify array
  
  # Get a single user
  app.get '/users/:id.json', (req, res) ->
    User
    .findOne({'_id':req.params.id})
    .run (err, user) ->
      if err || !user
        res.status 404
        res.send { error: 'User not found' }
      else
        obj = user.toClient()
        res.send JSON.stringify obj
  
  # Create a new user
  app.post '/users.json', (req, res) ->
    data = req.body
    user = new User { email: data.email, name: data.name, department: data.department }
    user.save (err, model) ->
      if err || !model
        res.status 400
        res.send { error: 'Missing required parameters' }
      else
        res.send JSON.stringify model