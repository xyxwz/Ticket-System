var mongoose = require("mongoose"),
    CommentSchema = require('./comment').CommentSchema,
    _ = require('underscore');

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
  assigned_to           : [{type : mongoose.Schema.Types.ObjectId, ref: 'User'}],
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
  obj.user.id = obj.user._id;
  delete obj._id;
  delete obj.user._id;
  delete obj.comments;
  if (typeof(obj.user.access_token) != 'undefined') delete obj.user.access_token;
  return obj;
};


/* Update Ticket *
*
*  data - A json object representing ticket properties to update
*     :title       - string, optional
*     :description - string, optional
*     :status      - string, optional, available options ['open', 'closed']
*
*  Updates a ticket and returns a ticket object
*  ready to be sent to the client. */
Ticket.methods.update = function(data, callback) {
  if (data.status) {
    this.status = data.status;
    if(data.status === "closed") this.closed_at = Date.now();
  }
  if (data.title) this.title = data.title;
  if (data.description) this.description = data.description;
  this.modified_at = Date.now();

  this.save(function(err, ticket) {
    if (err || !ticket) {
      callback('Error updating model. Check required attributes.');
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
*
*  Gets a list of all the tickets in the database based on status.
*  Uses the Mongoose Populate method to fill in information for the ticket user
*
* Returns an Array ready to be sent to the client. */
Ticket.statics.getAll = function(status, callback) {
  this
  .find({'status': status})
  .asc('opened_at')
  .populate('user')
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
