var mongoose = require('mongoose'),
    UserSchema = require('./schemas/user').User,
    _ = require('underscore');

module.exports = function(app) {


  function User (model) {
    this.model = model || new UserSchema();
  };

  /**
   *  update
   *
   *  Updates a user model.
   *
   *  data - A json object representing user properties to update
   *     :name         - string, optional
   *     :email        - string, optional
   *     :role         - string, optional, available options ['admin', 'member']
   *
   *  Returns a user object ready to be sent to the client.
   *
   *  @api public
   */

  User.prototype.update = function update(data, cb) {
    var user = this.model;

    if (data.email) user.email = data.email;
    if (data.name) user.name = data.name;
    if (data.role) user.role = data.role;

    user.save(function(err, model) {
      if (err || !model) {
        cb('Error updating model. Check required attributes.');
      }
      else {
        return cb(null, model.toClient());
      }
    });
  };


  /**
   *  remove
   *
   *  Removes a user from the database.
   *
   *  Returns an error or status "ok" to the callback
   *
   * @api public
   */

  User.prototype.remove = function remove(cb) {
    var user = this.model;

    user.remove(function(err) {
      if (err) return cb('Error removing user');
      return cb(null, "ok");
    });
  };


  /**
   * ----------------------------------------
   * Static Methods *
   * ----------------------------------------
   */


  /**
   *  all
   *
   *  Gets a list of all the users in the database.
   *
   *  Returns an Array ready to be sent to the client.
   *
   *  @api public
   */

  User.all = function all(cb) {
    var array, obj;

    UserSchema.find().run(function(err, models) {
      if(err || !models) {
        return cb("Error finding users");
      }
      else {
        array = [];
        _.each(models, function(user) {
          obj = user.toClient();
          array.push(obj);
        });
        return cb(null, array);
      }
    });
  };



  /**
   *  find
   *
   *  Retrieves a single user model by id.
   *
   *  :id - string, a user's BSON id
   *
   *  Returns a single user object ready to be sent to the client
   *
   *  @api public
   */

  User.find = function find(id, cb){
    UserSchema
    .findOne({'_id':id})
    .run(function(err, model){
      if(err || !model) {
        return cb("User not found");
      }
      else {
        return cb(null, model.toClient());
      }
    });
  };


  /**
   *  create
   *
   *  Creates a new user.
   *
   *  data - A json object representing user properties
   *     :name       - string
   *     :email      - string
   *     :role       - string, options include ['admin', 'member']
   *
   *  Returns a user object ready to be sent to the client.
   *
   *  @api public
   */

  User.create = function create(data, cb) {
    var user;

    user = new UserSchema({
      email: data.email,
      name: data.name,
      role: data.role
    });

    user.save(function(err, model) {
      if (err || !model) return cb(err);
      return cb(null, model.toClient());
    });
  };


  /**
   *  setAccessToken
   *
   *  Sets the access_token field for the user account.
   *
   *  :email - Email address returned by the authentication system
   *  :token - Access Token returned by the authentication system
   *
   *  Returns a user model
   */

  User.setAccessToken = function setAccessToken(email, token, cb) {
    UserSchema
    .findOne({'email':email})
    .run(function(err, model) {
      if(err || !model) return cb("Not an authorized user");

      model.access_token = token;

      model.save(function(err, user) {
        if(err) return cb("Error setting access token");
        return cb(null, user);
      });
    });
  };


  return User;

};
