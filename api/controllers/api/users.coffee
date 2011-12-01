mongoose = require 'mongoose'
User = mongoose.model 'User'
_ = require 'underscore'

module.exports = (app) ->

  # User Index
  # GET /users.json
  # returns a list of all the users in the database
  app.get '/users.json', (req, res) ->
    User
    .find()
    .run (err, users) ->
      array = []
      _.each users, (user) ->
        obj = user.toClient()
        array.push(obj)

      res.json array


  # Create a new user
  # POST /users.json
  #
  # body - A json object representing a user
  #        :email      - string
  #        :name       - string in format "first last"
  #        :department - string, used to determine permissions
  #
  # adds a user to the database
  app.post '/users.json', (req, res) ->
    data = req.body
    user = new User { email: data.email, name: data.name, department: data.department }
    user.save (err, model) ->
      if err || !model
        res.json { error: 'Missing required attributes' }, 400
      else
        obj = model.toClient()
        res.json obj



  # User Info
  # GET /users/:id.json
  #
  # id - The MongoDb BSON id converted to a string
  #
  # returns a single user
  app.get '/users/:id.json', (req, res) ->
    User
    .findOne({'_id':req.params.id})
    .run (err, user) ->
      if err || !user
        res.json { error: 'User not found' }, 404
      else
        obj = user.toClient()
        res.json obj


  # Update a user
  # PUT /users/:id.json
  #
  # id   - The MongoDb BSON id converted to a string
  # body - The attributes to update in the model
  #        :email      - string
  #        :name       - string in format "first last"
  #        :department - string, used to determine permissions
  #
  # updates the user instance with the passed in attributes
  app.put '/users/:id.json', (req, res) ->
    data = req.body
    User
    .findOne({'_id':req.params.id})
    .run (err, user) ->
      if err || !user
        res.json { error: 'User not found' }, 404
      else
        user.email = data.email if data.email
        user.name = data.name if data.name
        user.department = data.department if data.department
        user.save (err, model) ->
          if err || !model
            res.json { error: 'Error updating model. Check required attributes.' }, 400
          else
            obj = model.toClient()
            res.json obj


  # Delete a user
  # DELETE /users/:id.json
  #
  # id - The MongoDb BSON id converted to a string
  #
  # removes a user from the database
  app.del '/users/:id.json', (req, res) ->
    User
    .findOne({'_id':req.params.id})
    .run (err, user) ->
      if err || !user
        res.json { error: 'User not found' }, 404
      else
        user.remove (err) ->
          if err
            res.json { error: 'Error removing user' }, 400
          else
            res.json { success: 'ok' }

