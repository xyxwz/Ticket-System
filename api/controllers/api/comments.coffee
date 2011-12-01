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
        res.json { error: 'Ticket not found' }, 404
      else
        array = []
        _.each ticket.comments, (comment) ->
          obj = comment.toObject()
          obj.id = obj._id
          obj.user.id = obj.user._id
          delete obj._id
          delete obj.user._id
          array.push(obj)

        res.json array


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
        res.json { error: 'Ticket not found' }, 404
      else
        User
        .findOne({'_id': data.user})
        .run (err, user) ->
          if err || !user
            res.json { error: 'Not a valid user' }, 400
          else
            comment = new Comment({ comment: data.comment, user: user.id })
            ticket.comments.push(comment)
            ticket.save (err) ->
              if err
                res.json { error: 'Missing required parameters' }, 400
              else
                comment_data = { 'id':comment.id, 'comment':comment.comment, 'created':comment.created, 'user':user.toClient() }
                res.json comment_data


  # Single Comment
  # GET /tickets/:ticket_id/comments/:id.json
  #
  # ticket_id  - The MongoDb BSON ticket id converted to a string
  # comment_id - The MongoDb BSON comment id converted to a string
  #
  # returns a single comment with user information
  app.get '/tickets/:ticket_id/comments/:id.json', (req, res) ->
    Ticket
    .findOne({'_id': req.params.ticket_id})
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        comment = ticket.comments.id(req.params.id)
        if !comment
          res.json { error: 'Comment not found' }, 404
        else
          User
          .findOne({'_id': comment.user})
          .run (err, user) ->
            if err || !user
              res.json { error: 'Error finding comment user' }, 400
            else
              comment_data = { 'id':comment.id, 'comment':comment.comment, 'created':comment.created, 'user':user.toClient() }
              res.json comment_data


  # Update a comment
  # PUT /tickets/:ticket_id/comments/:id.json
  #
  # ticket_id  - The MongoDb BSON ticket id converted to a string
  # comment_id - The MongoDb BSON comment id converted to a string
  # body - A json object representing a ticket
  #        :comment   - string
  #        :user      - string, a user's BSON id in string form
  #
  # updates a comment within the ticket instance with the passed in attributes
  app.put '/tickets/:ticket_id/comments/:id.json', (req, res) ->
    data = req.body
    Ticket
    .findOne({'_id': req.params.ticket_id})
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        comment = ticket.comments.id(req.params.id)
        if !comment
          res.json { error: 'Comment not found' }, 404
        else
          comment.comment = data.comment if data.comment
          comment.user = data.user if data.user
          ticket.save (err, model) ->
            if err || !model
              res.json { error: 'Error updating model. Check required attributes.' }, 400
            else
              User
              .findOne({'_id': comment.user})
              .run (err, user) ->
                if err || !user
                  res.json { error: 'Error finding comment user' }, 400
                else
                  comment_data = { 'id':comment.id, 'comment':comment.comment, 'created':comment.created, 'user':user.toClient() }
                  res.json comment_data


  # Delete Comment
  # DELETE /tickets/:ticket_id/comments/:id.json
  #
  # ticket_id  - The MongoDb BSON ticket id converted to a string
  # comment_id - The MongoDb BSON comment id converted to a string
  #
  # removes a comment from the ticket
  app.del '/tickets/:ticket_id/comments/:id.json', (req, res) ->
    Ticket
    .findOne({'_id': req.params.ticket_id})
    .run (err, ticket) ->
      if err || !ticket
        res.json { error: 'Ticket not found' }, 404
      else
        ticket.comments.id(req.params.id).remove()
        ticket.save (err) ->
          if err
            res.json { error: 'Error removing comment' }, 400
          else
            res.json { success: 'ok' }

