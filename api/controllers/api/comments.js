var Comment;

module.exports = function(app) {

  Comment = app.models.Comment;

  /* Ticket Comments
  *  GET /api/tickets/:ticketID/comments
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *
  *  returns all of a ticket's comments. Uses the Mongoose
  *  Populate method to fill in information for the comment user. */
  app.get('/api/tickets/:ticketID/comments', function(req, res) {
    Comment.all(req.ticket.comments, function(err, comments) {
      res.json(comments);
    });
  });


  /* Create a new ticket comment
  *  POST /api/tickets/:ticketID/comments
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *  body - A json object representing a ticket
  *        :comment   - string
  *
  *  adds a comment to a ticket */
  app.post('/api/tickets/:ticketID/comments', function(req, res) {
    var data;

    data = req.body;
    data.user = req.user._id;

    Comment.create(req.ticket, req.user, data, function(err, model) {
      if(err) return res.json({error: err}, 400);
      res.json(model, 201);
    });
  });


  /* Single Comment
  *  GET /api/tickets/:ticketID/comments/:id
  *
  *  ticketID  - The MongoDb BSON ticket id converted to a string
  *  id         - The MongoDb BSON comment id converted to a string
  *
  *  returns a single comment with user information */
  app.get('/api/tickets/:ticketID/comments/:id', function(req, res) {
    Comment.find(req.ticket.comments, req.params.id, function(err, model) {
      if(err) return res.json({error: err}, 404);
      res.json(model);
    });
  });


  /* Update a comment
  *  PUT /api/tickets/:ticketID/comments/:id
  *
  *  ticketID   - The MongoDb BSON ticket id converted to a string
  *  id         - The MongoDb BSON comment id converted to a string
  *  body       - A json object representing a ticket
  *               :comment   - string
  *
  *  updates a comment within the ticket instance with the passed in attributes */
  app.put('/api/tickets/:ticketID/comments/:id', function(req, res) {
    var data, comment, klass;

    data = req.body;
    comment = req.ticket.comments.id(req.params.id);

    if(!comment) return res.json({error: "Comment not found"}, 404);

    klass = new Comment(comment, req.ticket);

    klass.update(data, function(err, comment) {
      if(err) return res.json({error: err}, 400);
      res.json(comment);
    });
  });


  /* Delete Comment
  * DELETE /api/tickets/:ticketID/comments/:id
  *
  * ticketID  - The MongoDb BSON ticket id converted to a string
  * id        - The MongoDb BSON comment id converted to a string
  *
  * removes a comment from the ticket */
  app.del('/api/tickets/:ticketID/comments/:id', function(req, res) {
    var comment, klass;

    comment = req.ticket.comments.id(req.params.id);

    if(!comment) return res.json({error: "Comment not found"}, 404);

    klass = new Comment(comment, req.ticket);

    klass.remove(function(err, status) {
      if(err) return res.json({error: "Error removing comment"}, 400);
      res.json({success: status});
    });
  });

};
