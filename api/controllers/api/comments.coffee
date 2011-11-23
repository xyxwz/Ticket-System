mongoose = require 'mongoose'
User = mongoose.model 'User'
Ticket = mongoose.model 'Ticket'
Comment = mongoose.model 'Comment'
_ = require 'underscore'

module.exports = (app) ->
  
  # Return a ticket's comments
  app.get '/tickets/:id/comments.json', (req, res) ->
    Ticket
    .findOne({'_id':req.params.id})
    .populate('comments.user')
    .run (err, ticket) ->
      if err || !ticket
        res.status 404
        res.send { error: 'Ticket not found' }
      else
        res.send JSON.stringify ticket.comments

  # Add a comment to a ticket
  app.post '/tickets/:id/comments.json', (req, res) ->
    data = req.body
    data.ticket = req.params.id
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
              comment_data = {'id':comment.id, 'comment':comment.comment, 'user':comment.user}
              res.send JSON.stringify comment_data