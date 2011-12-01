mongoose = require 'mongoose'
Ticket = mongoose.model 'Ticket'
User = mongoose.model 'User'
_ = require 'underscore'

module.exports = (app) ->

  # Ticket Index
  # GET /tickets.json
  #
  # returns a list of all the tickets in the database
  # marked as "open". Uses the Mongoose Populate method
  # to fill in information for the ticket user.
  app.get '/tickets.json', (req, res) ->
    Ticket
    .find({'status':'open'})
    .populate('user')
    .run (err, tickets) ->
      array = []
      _.each tickets, (ticket) ->
        obj = ticket.toClient()
        array.push(obj)

      res.json array
  

  # Create a new ticket
  # POST /tickets.json
  #
  # body - A json object representing a ticket
  #        :title       - string
  #        :description - string
  #        :user        - string, a user's BSON id in string form
  #
  # adds a ticket to the database
  app.post '/tickets.json', (req, res) ->
    data = req.body
    User.findOne {'_id': data.user}, (err, user) ->
      if err || !user
        res.json { error: 'Missing required attributes' }, 400
      else
        ticket = new Ticket { title: data.title, description: data.description, user: user.id }
        ticket.save (err, model) ->
          if err || !model
            res.json { error: 'Missing required attributes' }, 400
          else
            Ticket
              .findOne({'_id':model._id})
              .populate('user')
              .run (err, model) ->
                obj = model.toClient()
                res.json obj


  # Ticket Info
  # GET /tickets/:id.json
  #
  # id - The MongoDb BSON id converted to a string
  #
  # returns a single ticket
  app.get '/tickets/:id.json', (req, res) ->
    Ticket
    .findOne({'_id':req.params.id})
    .populate('user')
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        obj = ticket.toClient()
        res.json obj


  # Update a ticket
  # PUT /tickets/:id.json
  #
  # id   - The MongoDb BSON id converted to a string
  # body - The attributes to update in the model
  #        :title       - string
  #        :description - string
  #        :status      - string, "open" or "closed"
  #        :user        - string, a user's BSON id in string form
  #
  # updates the ticket instance with the passed in attributes
  app.put '/tickets/:id.json', (req, res) ->
    data = req.body
    Ticket
    .findOne({'_id':req.params.id})
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        ticket.title = data.title if data.title
        ticket.description = data.description if data.description
        ticket.status = data.status if data.status
        ticket.user = data.user if data.user
        ticket.save (err, model) ->
          if err || !model
            res.json { error: 'Error updating model. Check required attributes.' }, 400
          else
            Ticket
              .findOne({'_id':model._id})
              .populate('user')
              .run (err, model) ->
                obj = model.toClient()
                res.json obj


  # Delete a ticket
  # DELETE /tickets/:id.json
  #
  # id - The MongoDb BSON id converted to a string
  #
  # removes a ticket from the database
  app.del '/tickets/:id.json', (req, res) ->
    Ticket
    .findOne({'_id':req.params.id})
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        ticket.remove (err) ->
          if err
            res.json { error: 'Error removing ticket' }, 400
          else
            res.json { success: 'ok' }

