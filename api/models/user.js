var mongoose = require("mongoose"),
    _ = require('underscore');

var User = new mongoose.Schema({
  email         : {type : String, default:  '', required: true, trim: true,
                   lowercase: true, index: { unique: true }},
  name          : {type : String, default : '', required: true, trim: true},
  role          : {type : String, default : '', required: true, trim: true,
                   enum: ['admin', 'member']},
  created_at    : {type : Date,   default : Date.now, required: true},
  access_token  : {type : String, trim: true, index: true}
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
  if (typeof(obj.access_token) != 'undefined') delete obj.access_token;
  return obj;
}


/* Update User *
*
*  data - A json object representing user properties to update
*     :name         - string, optional
*     :email        - string, optional
*     :role         - string, optional, available options ['admin', 'member']
*
*  Updates a user and returns a user object
*  ready to be sent to the client. */
User.methods.update = function(data, callback) {
  if (data.email) this.email = data.email;
  if (data.name) this.name = data.name;
  if (data.role) this.role = data.role;
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
*     :role       - string, options include ['admin', 'member']
*
*  Creates a new user.
*  Returns a user object ready to be sent to the client. */
User.statics.create = function(data, callback) {
  var self = this;
  var user = new self({
    email: data.email,
    name: data.name,
    role: data.role
  });
  user.save(function(err, model) {
    if (err || !model) return callback("Error saving user");
    return callback(null, model.toClient());
  });
}


/* Set User Access Token *
*
*  :email - Email address returned by the authentication system
*  :token - Access Token returned by the authentication system
*
*  Sets the access_token field for the user account */
User.statics.setAccessToken = function(email, token, callback) {
  this
  .findOne({'email':email})
  .run(function(err, model) {
    if(err || !model) return callback("Not an authorized user");
    model.access_token = token;
    model.save(function(err, user) {
      if(err) return callback("Error setting access token");
      return callback(null, token);
    });
  });
};


exports.User = mongoose.model('User', User);
