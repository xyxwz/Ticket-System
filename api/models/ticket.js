var mongoose = require('mongoose'),
    redis = require('redis'),
    TicketSchema = require('./schemas/ticket').Ticket,
    _ = require('underscore');

module.exports = function(app) {


  function Ticket (model) {
    this.model = model || new TicketSchema();
    this.redis = app.redis;
  };


  /**
   *  toClient
   *
   *  Returns an object for use with client-side js.
   *  Sets the mongo _id property name to id
   *
   *  @api private
   */

  Ticket.prototype._toClient = function toClient(cb) {
    var obj, user;

    obj = this.model.toObject();
    obj.id = obj._id;
    delete obj._id;

    user = {
      id: obj.user._id,
      name: obj.user.name,
    }

    obj.user = user;
    delete obj.comments;

    // Get assigned_to from redis
    this.redis.SMEMBERS(obj.id, function(err, members) {
      if(err) return cb(err);
      obj.assigned_to = members;
      cb(null, obj);
    });
  };


  /**
   *  update
   *
   *  Updates a ticket.
   *
   *  data - A json object representing ticket properties to update
   *     :title       - string, optional
   *     :description - string, optional
   *     :status      - string, optional, available options ['open', 'closed']
   *     :assigned_to - array, optional, collection of userID's
   *
   *  Returns an object ready to be sent to the client
   *
   *  @api public
   */

  Ticket.prototype.update = function update(data, callback) {
    var _this, model, newAssigned;

    _this = this;
    model = this.model;

    if (data.status) {
      if(model.status === "open" && data.status === "closed") {
        model.closed_at = Date.now();
      }
      model.status = data.status;
    }

    if (data.title) model.title = data.title;
    if (data.description) model.description = data.description;

    // Manage assigned users
    if (data.assigned_to) {
      newAssigned = _.uniq(data.assigned_to);

      this._manageSets(newAssigned, function() {
        _this._execUpdate(callback);
      });
    }
    else {
      this._execUpdate(callback);
    }
  };


  /**
   *  manageSets
   *
   *  Adds/Removes TicketID in Redis Set. Set key is the
   *  User's mongoID. Finds the difference between the current
   *  assigned_to array and the new assigned_to array then checks
   *  if the id is new or old in order to determine if it needs
   *  to be added or removed from the set.
   *
   *    :newArray  -  The array passed in the put request for
   *                  assigned_users
   *    :callback  -  A callback to run when completed
   *
   *  returns callback(null)
   *
   *  @api private
   */

  Ticket.prototype._manageSets = function manageSets(array, callback) {
    var redis, _this, model, newArray, currentArray, exists, _add, _rem;

    _this = this;
    model = this.model;
    redis = this.redis;
    newArray = new Array();
    currentArray = new Array();
    _add = new Array();
    _rem = new Array();

    redis.SMEMBERS(model.id, function(err, members) {

      // Ensure input is strings before comparing
      _.each(array, function(user){
        newArray.push(user.toString());
      });

      // Ensure input is strings before comparing
      _.each(members, function(user){
        currentArray.push(user.toString());
      });

      _add = _.difference(_.uniq(newArray), _.uniq(currentArray));
      _rem = _.difference(_.uniq(currentArray), _.uniq(newArray));

      _.each(_add, function(user) {
        redis.SADD(user, model.id);
        redis.SADD(model.id, user);
      });

      _.each(_rem, function(user) {
        redis.SREM(user, model.id);
        redis.SREM(model.id, user);
      });

      return callback(null);
    });
  };


  /**
   *  execUpdate
   *
   *  Runs the save function to update a ticket after other
   *  functions have been run. Takes a callback to return the
   *  saved ticket's toClient() properties.
   *
   *    :callback - A callback to run
   *
   *  returns formatted ticket ready to send to client
   *
   *  @api private
   */

  Ticket.prototype._execUpdate = function execUpdate(callback) {
    var _this, model, obj;

    _this = this;
    model = this.model;
    model.modified_at = Date.now();

    model.save(function(err, ticket) {
      if (err || !ticket) {
        return callback('Error updating model. Check required attributes.');
      }
      else {
        obj = new Ticket(ticket);

        obj._toClient(function(err, ticket){
          if(err) return callback(err);
          callback(null, ticket);
        });
      }
    });
  };


  /**
   *  remove
   *
   *  Removes a ticket from the database.
   *
   *  Returns an error or status "ok" to the callback
   *
   *  @api public
   */

  Ticket.prototype.remove = function remove(callback) {
    var ticket = this.model;

    ticket.remove(function(err) {
      if (err) return callback(err);
      return callback(null, "ok");
    });
  };


  /**
   * ----------------------------------------
   * Static Methods
   * ----------------------------------------
   */


  /**
   *  all
   *
   *  Gets a list of all the tickets in the database based on status.
   *  Uses the Mongoose Populate method to fill in information for the ticket user
   *
   *  :status - string, accepted values: ["open", "closed"]
   *  :page - int, determines what set of tickets to return
   *
   *  Returns an Array ready to be sent to the client.
   *
   *  @api public
   */

  Ticket.all = function all(status, page, callback) {
    var query, array, count, _i, obj;

    query = TicketSchema.find({'status': status});

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
        array = [];
        _i = 0;
        count = models.length;
        while(_i < count) {
          obj = new Ticket(models[_i]);

          obj._toClient(function(err, model) {
            if (err) return callback(err);
            array.push(model);
            if(array.length === count) {
              return callback(null, array);
            }
          });
          _i++;
        }
      }
    });
  };


  /**
   *  mine
   *
   *  Get all of the tickets currently assigned to a user
   *
   *  :user   - A user ID
   *  :status - string, accepted values: ["open", "closed"]
   *  :page   - int, determines what set of tickets to return
   *
   *  Returns an Array ready to be sent to the client.
   *
   *  @api public
   */

  Ticket.mine = function mine(user, status, page, callback) {
    var _this, redis, obj, query, array, count, _i;

    _this = this;
    redis = app.redis;

    redis.SMEMBERS(user, function(err, res){
      query = TicketSchema
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
          array = [];
          _i = 0;
          count = models.length;
          while(_i < count) {
            obj = new Ticket(models[_i]);
            obj._toClient(function(err, model) {
              if (err) return callback(err);
              array.push(obj);
              if(array.length === count) {
                return callback(null, array);
              }
            });
            _i++;
          }
        }
      });
    });
  };


  /**
   *  find
   *
   *  Retrieves a single ticket model by id.
   *
   *  :id - string, a tickets BSON id
   *
   *  Return a single ticket object ready to be sent to the client
   *
   *  @api public
   */

  Ticket.find = function find(id, callback) {
    var _this, obj;

    TicketSchema
    .findOne({'_id':id})
    .populate('user')
    .run(function(err, model) {
      if(err || !model){
        return callback("Error finding ticket");
      }
      else {
        obj = new Ticket(model);

        obj._toClient(function(err, ticket){
          if(err) return callback(err);
          return callback(null, ticket);
        });
      }
    });
  };


  /**
   *  create
   *
   *  Creates a new ticket with the status of "open"
   *
   *  data - A json object representing ticket properties
   *     :title       - string
   *     :description - string
   *     :user        - string, a user instance BSON id
   *
   *  Returns a ticket object ready to be sent to the client.
   *
   *  @api public
   */

  Ticket.create = function create(data, callback) {
    var _this, ticket;

    _this = this;

    ticket = new TicketSchema({
      title: data.title,
      description: data.description,
      user: data.user
    });

    ticket.save(function(err, ticket) {
      if (err || !ticket) {
        return callback(err);
      }
      else {
        // Run find() to ensure new ticket is populated
        _this.find(ticket._id, function(err, model){
          if(err) return callback(err);
          return callback(null, model);
        });
      }
    });
  };

  return Ticket;

};

