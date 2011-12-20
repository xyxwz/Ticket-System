var mongoose = require('mongoose');
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');
var _ = require('underscore');

module.exports = function(app) {

  /* Ticket Index
  *  GET /api/tickets.json
  *
  *  returns a list of all the tickets in the database
  *  marked as "open". Uses the Mongoose Populate method
  *  to fill in information for the ticket user. */
  app.get('/api/tickets.json', function(req, res) {
    var status = req.query.status ? req.query.status : 'open';
    Ticket.getAll(status, function(err, tickets){
      if(err) return res.json({error: 'Error getting tickets'}, 400);
      res.json(tickets);
    });
  });


  /* Create a new ticket
  *  POST /api/tickets.json
  *
  *  body - A json object representing a ticket
  *        :title       - string
  *        :description - string
  *        :user        - string, a user's BSON id in string form
  *
  *  adds a ticket to the database */
  app.post('/api/tickets.json', function(req, res) {
    var data = req.body;
    User.getSingle(data.user, function(err, user) {
      if(err) return res.json({error: 'User ID is required for ticket'}, 400);
      data.user = user.id;
      Ticket.create(data, function(err, ticket) {
        if(err) return res.json({error: 'Missing required attributes'}, 400);
        res.json(ticket);
      });
    });
  });


  /* Ticket Info
  *  GET /api/tickets/:ticketID.json
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *
  *  returns a single ticket */
  app.get('/api/tickets/:ticketID.json', function(req, res) {
    var ticket = req.ticket;
    res.json(ticket.toClient());
  });


  /* Update a ticket
  *  PUT /api/tickets/:ticketID.json
  *
  *  ticketID   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :title       - string
  *        :description - string
  *        :status      - string, "open" or "closed"
  *
  *  updates the ticket instance with the passed in attributes */
  app.put('/api/tickets/:ticketID.json', function(req, res) {
    var data = req.body;
    var ticket = req.ticket;
    ticket.update(data, function(err, model) {
      if(err) return res.json({error: 'Error updating ticket'});
      res.json(model);
    });
  });


  /* Delete a ticket
  *  DELETE /api/tickets/:ticketID.json
  *
  *  ticketID - The MongoDb BSON id converted to a string
  *
  *  removes a ticket from the database */
  app.del('/api/tickets/:ticketID.json', function(req, res) {
    var ticket = req.ticket;
    ticket.removeTicket(function(err, status) {
      if(err) return res.json({error: 'Error removing ticket'});
      res.json({success: "ok"});
    });
  });

};
