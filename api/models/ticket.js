var mongoose = require("mongoose"),
    CommentSchema = require('./comment').CommentSchema,
    _ = require('underscore'),
    redis = require('redis'),
    client = redis.createClient();

var Ticket = new mongoose.Schema({
  status                : {type : String, default : 'open', enum: ['open', 'closed'], index: true, required: true},
  title                 : {type : String, default : '', required: true, trim: true},
  description           : {type : String, default : '', required: true, trim: true},
  opened_at             : {type : Date, default : Date.now, index: true, required: true},
  closed_at             : {type : Date, index: true},
  modified_at           : {type : Date},
  user                  : {type : mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true},
  comments              : [CommentSchema],
  participating_users   : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
  assigned_to           : [{type : mongoose.Schema.Types.ObjectId}],
});


/* ---------------------------------------- *
 * Instance Methods *
 * ---------------------------------------- */


/* To Client *
*
*  Returns an object for use with client-side js.
*  Sets the mongo _id property name to id */
Ticket.methods.toClient = function(){
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;

  var user = {
    id: obj.user._id,
    name: obj.user.name,
  }
  obj.user = user;

  delete obj.comments;
  return obj;
};


/* Update Ticket *
*
*  data - A json object representing ticket properties to update
*     :title       - string, optional
*     :description - string, optional
*     :status      - string, optional, available options ['open', 'closed']
*     :assigned_to - array, optional, collection of userID's
*
*  Updates a ticket and returns a ticket object
*  ready to be sent to the client. */
Ticket.methods.update = function(data, callback) {
  var self = this, newAssigned;

  if (data.status) {
    this.status = data.status;
    if(data.status === "closed") this.closed_at = Date.now();
  }
  if (data.title) this.title = data.title;
  if (data.description) this.description = data.description;

  // Manage assigned users
  if (data.assigned_to) {
    newAssigned = _.uniq(data.assigned_to);
    this.manageSets(newAssigned, function() {
      self.runUpdate(callback);
    });
  }
  else {
    this.runUpdate(callback);
  }
}

/* Manage Redis Sets *
 *
 * Adds/Removes TicketID in Redis Set. Set key is the
 * User's mongoID. Finds the difference between the current
 * assigned_to array and the new assigned_to array then checks
 * if the id is new or old in order to determine if it needs
 * to be added or removed from the set.
 *
 *  :newArray  -  The array passed in the put request for
 *                assigned_users
 *  :callback  -  A callback to run when completed
 *
 * returns callback(null) */
Ticket.methods.manageSets = function(newArray, callback) {
  var self = this,
      _add = _.difference(newArray, this.assigned_to),
      _rem = _.difference(this.assigned_to, newArray);

  _.each(_add, function(user) {
    client.sadd(user, self._id);
  });

  _.each(_rem, function(user) {
    client.srem(user, self._id);
  });

  this.assigned_to = newArray;

  return callback(null);
}

/* Exec Update
 *
 * Runs the save function to update a ticket after other
 * functions have been run. Takes a callback to return the
 * saved ticket's toClient() properties.
 *
 *    :callback - A callback to run
 *
 * returns callback(null, this.toClient()) */
Ticket.methods.runUpdate = function(callback) {
  this.modified_at = Date.now();

  this.save(function(err, ticket) {
    if (err || !ticket) {
      return callback('Error updating model. Check required attributes.');
    }
    else {
      return callback(null, ticket.toClient());
    }
  });
}

/* Delete Ticket *
*
*  Removes a ticket from the database.
*  Returns an error or status "ok" to the callback */
Ticket.methods.removeTicket = function(callback) {
  this.remove(function(err) {
    if (err) return callback('Error removing ticket');
    return callback(null, "ok");
  });
}


/* ---------------------------------------- *
 * Static Methods *
 * ---------------------------------------- */


/* Return All Tickets
*
*  :status - string, accepted values: ["open", "closed"]
*  :page - int, determines what set of tickets to return
*
*  Gets a list of all the tickets in the database based on status.
*  Uses the Mongoose Populate method to fill in information for the ticket user
*
* Returns an Array ready to be sent to the client. */
Ticket.statics.getAll = function(status, page, callback) {
  var query = this.find({'status': status});

  if(status === 'open') {
    query.asc('opened_at')
  }
  else {
    query.desc('closed_at')
  }

  query
  .populate('user')
  .skip((page - 1) * 10)
  .limit(10)
  .run(function(err, models){
    if(err || !models) {
      return callback("Error finding tickets");
    }
    else {
      var array = [];
      _.each(models, function(ticket) {
        var obj = ticket.toClient();
        array.push(obj);
      });
      return callback(null, array);
    }
  });
}


/* Return All Tickets Assigned To A User
*
* */
Ticket.statics.getMyTickets = function(user, status, page, callback) {
  var self = this;

  client.smembers(user, function(err, res){
    var query = self
    .where('_id')
    .in(res)
    .where('status', status);

    if(status === 'open') {
      query.asc('opened_at')
    }
    else {
      query.desc('closed_at')
    }

    query
    .populate('user')
    .skip((page - 1) * 10)
    .limit(10)
    .run(function(err, models) {
      if(err) {
        return callback("Error finding tickets");
      }
      else {
        var array = [];
        _.each(models, function(ticket) {
          var obj = ticket.toClient();
          array.push(obj);
        });
        return callback(null, array);
      }
    });
  });
}

/* Return A Single Ticket
*
*  :id - string, a tickets BSON id
*
*  Return a single ticket object ready to be sent to the client */
Ticket.statics.getSingle = function(id, callback) {
  this
  .findOne({'_id':id})
  .populate('user')
  .run(function(err, model) {
    if(err || !model){
      return callback("Error finding ticket");
    }
    else {
      return callback(null, model.toClient());
    }
  });
}


/* Create A Ticket *
*
*  data - A json object representing ticket properties
*     :title       - string
*     :description - string
*     :user        - string, a user instance BSON id
*
*  Creates a new ticket with the status of "open"
*  Returns a ticket object ready to be sent to the client. */
Ticket.statics.create = function(data, callback) {
  var self = this;
  var ticket = new self({
    title: data.title,
    description: data.description,
    user: data.user
  });
  ticket.save(function(err, ticket) {
    if (err || !ticket) {
      return callback("Error saving ticket");
    }
    else {
      self.getSingle(ticket._id, function(err, model){
        return callback(null, model);
      });
    }
  });
}


exports.Ticket = mongoose.model('Ticket', Ticket);
