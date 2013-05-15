var mongoose = require('mongoose'),
    UserSchema = require('./schemas/user').User,
    _ = require('underscore');

module.exports = function(app) {


  function User (model) {
    this.model = model || new UserSchema();
  }

  /**
   *  update
   *
   *  Updates a user model.
   *
   *  data - A json object representing user properties to update
   *     :name         - string, optional
   *     :username     - string, optional
   *     :role         - string, optional, available options ['admin', 'member']
   *
   *  Returns a user object ready to be sent to the client.
   *
   *  @api public
   */

  User.prototype.update = function update(data, cb) {
    var user = this.model;

    if (data.username) user.username = data.username;
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

    UserSchema.find().exec(function(err, models) {
      if(err) {
        return cb("Error finding users");
      }
      else {
        array = [];
        _.each(models, function(user) {
          if(user.role === 'read') return;
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
    .exec(function(err, model){
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
   *     :username      - string
   *     :name          - string
   *     :role          - string, options include ['admin', 'member']
   *     :access_token  - string, oAuth access token
   *     :avatar        - string, url to a profile photo (optional)
   *
   *  Returns a user object ready to be sent to the client.
   *
   *  @api public
   */

  User.create = function create(data, cb) {
    var user;

    user = new UserSchema({
      username: data.username,
      name: data.name,
      role: data.role,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      avatar: data.avatar
    });

    user.save(function(err, model) {
      if (err || !model) return cb(err);
      return cb(null, model.toClient());
    });
  };


  /**
   *  authorize
   *
   *  Takes an oAuth response and gets a User or
   *  if the user doesn't exist create a user with
   *  base permissions.
   *
   *  oAuth should manage access control to the application
   *
   *  :access_token        - access_token returned from oAuth response
   *  :request_token       - request_token returned from oAuth response
   *  :profile             - profile information returned from oAuth response
   *
   *  Returns an authorized user profile to store in session
   *
   *  @api private
   */

  User._authorize = function authorize(access_token, refresh_token, profile, cb) {
    var data;

    UserSchema
    .findOne({ 'username': profile.username })
    .exec(function(err, model) {
      if(err) return cb(err);

      if(!model) {
        // create a new user if not found
        data = {
          username: profile.username,
          name: profile.name,
          role: profile.role,
          access_token: access_token,
          avatar: profile.avatar
        };

        User.create(data, function(err, model) {
          if(err) return cb(err);
          return cb(null, model);
        });
      }
      else {
        model.access_token = access_token;
        model.save(function(err, user) {
          if(err) return cb(err);
          return cb(null, user);
        });
      }
    });
  };


  /**
   *  admins
   *
   *  Get all the system admins
   *
   *  Returns system admins ready to be sent to the client
   *
   *  @api public
   */

  User.admins = function admins(cb) {
    var users;

    UserSchema
    .where('role', 'admin')
    .exec(function(err, models) {
      if(err) return cb('error getting admins');

      users = models.map(function(user) {
        return user.toClient();
      });

      return cb(null, users);
    });
  };


  return User;

};
