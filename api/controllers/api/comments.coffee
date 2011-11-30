mongoose = require 'mongoose'
User = mongoose.model 'User'
Ticket = mongoose.model 'Ticket'
Comment = mongoose.model 'Comment'
_ = require 'underscore'

module.exports = (app) ->
  
  # Ticket Comments
  # GET /tickets/:id/comments.json
  #
  # id - The MongoDb BSON id converted to a string
  #
  # returns all of a ticket's comments. Uses the Mongoose
  # Populate method to fill in information for the comment user.
  app.get '/tickets/:id/comments.json', (req, res) ->
    Ticket
    .findOne({'_id':req.params.id})
    .populate('comments.user')
    .run (err, ticket) ->
      if err || !ticket
        res.status 404
        res.send { error: 'Ticket not found' }
      else
        array = []
        _.each ticket.comments, (comment) ->
          obj = comment.toObject()
          obj.id = obj._id
          obj.user.id = obj.user._id
          delete obj._id
          delete obj.user._id
          array.push(obj)

        res.send JSON.stringify array


  # Create a new ticket comment
  # POST /tickets/:id/comments.json
  #
  # id - The MongoDb BSON id converted to a string
  # body - A json object representing a ticket
  #        :comment   - string
  #        :user      - string, a user's BSON id in string form
  #
  # adds a comment to a ticket
  app.post '/tickets/:id/comments.json', (req, res) ->
    data = req.body
    Ticket
    .findOne({'_id': req.params.id})
    .run (err, ticket) ->
      if err || !ticket
        res.status 404
        res.send { error: 'Ticket not found' }
      else
        User
        .findOne({'_id': data.user})
        .run (err, user) ->
          if err || !user
            res.status 400
            res.send { error: 'Not a valid user' }
          else
            comment = new Comment({ comment: data.comment, user: user.id })
            ticket.comments.push(comment)
            ticket.save (err) ->
              if err
                res.status 400
                res.send { error: 'Missing required parameters' }
              else
                comment_data = {'id':comment.id, 'comment':comment.comment, 'user':user.toClient()}
                res.send JSON.stringify comment_data

