var mongoose = require('mongoose');
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');
var _ = require('underscore');

module.exports = function(app) {

  /* Ticket Index
  *  GET /tickets.json
  *
  *  returns a list of all the tickets in the database
  *  marked as "open". Uses the Mongoose Populate method
  *  to fill in information for the ticket user. */
  app.get('/tickets.json', function(req, res) {
    Ticket
    .find({'status': 'open'})
    .populate('user')
    .run(function(err, tickets) {
      var array = [];
      _.each(tickets, function(ticket) {
        var obj = ticket.toClient();
        array.push(obj);
      });
      res.json(array);
    });
  });


  /* Create a new ticket
  *  POST /tickets.json
  *
  *  body - A json object representing a ticket
  *        :title       - string
  *        :description - string
  *        :user        - string, a user's BSON id in string form
  *
  *  adds a ticket to the database */
  app.post('/tickets.json', function(req, res) {
    var data = req.body;
    User.findOne({'_id': data.user}, function(err, user) {
      if (err || !user) {
        res.json({error: 'Missing required attributes'}, 400);
      } 
      else {
        var ticket = new Ticket({
          title: data.title,
          description: data.description,
          user: user.id
        });
        ticket.save(function(err, model) {
          if (err || !model) {
            res.json({error: 'Missing required attributes'}, 400);
          } 
          else {
            Ticket
            .findOne({'_id': model._id})
            .populate('user')
            .run(function(err, model) {
              var obj = model.toClient();
              res.json(obj);
            });
          }
        });
      }
    });
  });
  

  /* Ticket Info
  *  GET /tickets/:id.json
  *
  *  id - The MongoDb BSON id converted to a string
  *
  *  returns a single ticket */
  app.get('/tickets/:id.json', function(req, res) {
    Ticket
    .findOne({'_id': req.params.id})
    .populate('user')
    .run(function(err, ticket) {
      if (err || !ticket) {
        res.json({error: 'Ticket not found'}, 404);
      } 
      else {
        var obj = ticket.toClient();
        res.json(obj);
      }
    });
  });
  

  /* Update a ticket
  *  PUT /tickets/:id.json
  *
  *  id   - The MongoDb BSON id converted to a string
  *  body - The attributes to update in the model
  *        :title       - string
  *        :description - string
  *        :status      - string, "open" or "closed"
  *        :user        - string, a user's BSON id in string form
  *
  *  updates the ticket instance with the passed in attributes */
  app.put('/tickets/:id.json', function(req, res) {
    var data = req.body;
    Ticket.findOne({'_id': req.params.id}).run(function(err, ticket) {
      if (err || !ticket) {
        res.json({error: 'Ticket not found'}, 404);
      } 
      else {
        if (data.title) ticket.title = data.title;
        if (data.description) ticket.description = data.description;
        if (data.status) ticket.status = data.status;
        if (data.user) ticket.user = data.user;
        ticket.save(function(err, model) {
          if (err || !model) {
            res.json({error: 'Error updating model. Check required attributes.'}, 400);
          } 
          else {
            Ticket
            .findOne({'_id': model._id})
            .populate('user')
            .run(function(err, model) {
              var obj = model.toClient();
              res.json(obj);
            });
          }
        });
      }
    });
  });
  

  /* Delete a ticket
  *  DELETE /tickets/:id.json
  *
  *  id - The MongoDb BSON id converted to a string
  *
  *  removes a ticket from the database */
  app.del('/tickets/:id.json', function(req, res) {
    Ticket
    .findOne({'_id': req.params.id})
    .run(function(err, ticket) {
      if (err || !ticket) {
        res.json({error: 'Ticket not found'}, 404);
      } 
      else {
        ticket.remove(function(err) {
          if (err) {
            res.json({error: 'Error removing ticket'}, 400);
          } 
          else {
            res.json({success: 'ok'});
          }
        });
      }
    });
  });

};
