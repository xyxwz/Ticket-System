var mongoose = require("mongoose"),
    _ = require('underscore');

var User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type : String, default : '', required: true, trim: true},
  department    : {type : String, default : '', required: true, trim: true,
                   enum: ['IT', 'K12']},
  created       : {type : Date,   default : Date.now, required: true}
});


/* ---------------------------------------- *
 * Instance Methods *
 * ---------------------------------------- */


/* To Client *
*
*  Returns an object for use with client-side js.
*  Sets the mongo _id property name to id */
User.methods.toClient = function(){
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
}


/* Update User *
*
*  data - A json object representing user properties to update
*     :name         - string, optional
*     :email        - string, optional
*     :department   - string, optional, available options ['IT', 'K12']
*
*  Updates a user and returns a user object
*  ready to be sent to the client. */
User.methods.update = function(data, callback) {
  if (data.email) this.email = data.email;
  if (data.name) this.name = data.name;
  if (data.department) this.department = data.department;
  this.save(function(err, model) {
    if (err || !model) {
      callback('Error updating model. Check required attributes.');
    }
    else {
      return callback(null, model.toClient());
    }
  });
}


/* Delete User *
*
*  Removes a user from the database.
*  Returns an error or status "ok" to the callback */
User.methods.removeUser = function(callback) {
  this.remove(function(err) {
    if (err) return callback('Error removing user');
    return callback(null, "ok");
  });
}


/* ---------------------------------------- *
 * Static Methods *
 * ---------------------------------------- */


/* Return All Users
*
*
*  Gets a list of all the users in the database.
*
* Returns an Array ready to be sent to the client. */
User.statics.getAll = function(callback){
  this.find().run(function(err, models){
    if(err || !models) {
      return callback("Error finding users");
    }
    else {
      var array = [];
      _.each(models, function(user) {
        var obj = user.toClient();
        array.push(obj);
      });
      return callback(null, array);
    }
  });
}


/* Return A Single User
*
*  :id - string, a user's BSON id
*
*  Return a single user object ready to be sent to the client */
User.statics.getSingle = function(id, callback){
  this
  .findOne({'_id':id})
  .run(function(err, model){
    if(err || !model) {
      return callback("User not found");
    }
    else {
      return callback(null, model.toClient());
    }
  });
}


/* Create A User *
*
*  data - A json object representing user properties
*     :name       - string
*     :email      - string
*     :department - string, options include ['IT', 'K12']
*
*  Creates a new user.
*  Returns a user object ready to be sent to the client. */
User.statics.create = function(data, callback) {
  var self = this;
  var user = new self({
    email: data.email,
    name: data.name,
    department: data.department
  });
  user.save(function(err, model) {
    if (err || !model) return callback("Error saving user");
    return callback(null, model.toClient());
  });
}


mongoose.model('User', User);
