mongoose = require 'mongoose'
Ticket = mongoose.model 'Ticket'
User = mongoose.model 'User'
_ = require 'underscore'

module.exports = (app) ->

  # Get all open tickets
  app.get '/tickets.json', (req, res) ->
    Ticket
    .find({'status':'open'})
    .populate('user')
    .run (err, tickets) ->
      array = []
      _.each tickets, (ticket) ->
        obj = ticket.toClient()
        array.push(obj)

      res.send JSON.stringify array
  
  # Get a single ticket by ID
  app.get '/tickets/:id.json', (req, res) ->
    Ticket
    .findOne({'_id':req.params.id})
    .populate('user')
    .run (err, ticket) ->
      if err || !ticket
        res.status 404
        res.send { error: 'Ticket not found' }
      else
        obj = ticket.toClient()
        res.send JSON.stringify obj
  
  # Create a new open ticket
  app.post '/tickets.json', (req, res) ->
    data = req.body
    User.findOne {'_id': data.user}, (err, user) ->
      if err || !user
        res.status 400
        res.send { error: 'Missing required parameters' }
      else
        ticket = new Ticket { title: data.title, description: data.description, user: user.id }
        ticket.save (err, model) ->
          if err || !model
            res.status 400
            res.send { error: 'Missing required parameters' }
          else
            res.send JSON.stringify model