var Ticket;

module.exports = function(app) {

  Ticket = app.models.Ticket;

  /* Ticket Index
  *  GET /api/tickets
  *
  *  returns a list of all the tickets in the database
  *  marked as :status and :page. Uses the Mongoose Populate method
  *  to fill in information for the ticket user. */
  app.get('/api/tickets', function(req, res) {
    var args = {};

    if (req.query.status) args.status = req.query.status;
    if (req.query.page) args.page = req.query.page;

    Ticket.all(req.user._id, args, function(err, tickets){
      if(err) return res.json({error: 'Error getting tickets'}, 400);
      res.json(tickets);
    });
  });

  /* User's Ticket Index
  *  GET /api/tickets/mine
  *
  *  returns a list of all the user's tickets in the database
  *  marked as :status and :page. Uses the Mongoose Populate method
  *  to fill in information for the ticket user. */
  app.get('/api/tickets/mine', function(req, res) {
    var args = {};

    if (req.query.status) args.status = req.query.status;
    if (req.query.page) args.page = req.query.page;

    Ticket.mine(req.user._id, args, function(err, tickets){
      if(err) return res.json({error: 'Error getting tickets'}, 400);
      res.json(tickets);
    });
  });


  /* Create a new ticket
  *  POST /api/tickets
  *
  *  body - A json object representing a ticket
  *        :title       - string
  *        :description - string
  *
  *  adds a ticket to the database */
  app.post('/api/tickets', function(req, res) {
    var data = req.body;
    data.user = req.user._id;
    Ticket.create(data, req.user, function(err, ticket) {
      if(err) return res.json({error: 'Missing required attributes'}, 400);
      res.json(ticket, 201);
    });
  });

  /**
   * Follow a ticket
   *
   * Adds user to the tickets participating set
   */

  app.post('/api/tickets/:ticketID/follow', function(req, res) {
    Ticket.follow(req.user._id, req.ticket._id, function(err) {
      if(err) return res.json({participating: false, error: 'Could not follow'}, 400);
      res.json({participating: true}, 201);
    });
  });

  /**
   * Unfollow a ticket
   *
   * Removes a user from the tickets participating set
   */

  app.del('/api/tickets/:ticketID/follow', function(req, res) {
    Ticket.unfollow(req.user._id, req.ticket._id, function(err) {
      if(err) return res.json({participating: true, error: 'Could not unfollow'}, 400);
      res.json({participating: false}, 200);
    });
  });


  /* Ticket Info
  *  GET /api/tickets/:ticketID
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *
  *  returns a single ticket */
  app.get('/api/tickets/:ticketID', function(req, res) {
    var ticket;

    ticket = new Ticket(req.ticket);

    ticket._toClient(function(err, obj){
      if(err) return res.json({error: 'Error getting ticket'}, 400);
      res.json(obj);
    });
  });


  /* Update a ticket
  *  PUT /api/tickets/:ticketID
  *
  *  ticketID   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :title       - string
  *        :description - string
  *        :status      - string, "open" or "closed"
  *
  *  updates the ticket instance with the passed in attributes */
  app.put('/api/tickets/:ticketID', function(req, res) {
    var data, ticket;

    data = req.body;
    ticket = new Ticket(req.ticket);

    ticket.update(data, req.user, function(err, model) {
      if(err) return res.json({error: 'Error updating ticket'}, 400);
      res.json(model);
    });
  });


  /* Delete a ticket
  *  DELETE /api/tickets/:ticketID
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *
  *  removes a ticket from the database */
  app.del('/api/tickets/:ticketID', function(req, res) {
    var ticket;

    ticket = new Ticket(req.ticket);

    ticket.remove(function(err, status) {
      if(err) return res.json({error: 'Error removing ticket'}, 400);
      res.json({success: "ok"});
    });
  });

};
