var mongoose = require('mongoose'),
    redis = require('redis'),
    _ = require('underscore'),
    TicketSchema = require('./schemas/ticket').Ticket,
    Notifications = require('./helpers/').Notifications;


module.exports = function(app) {


  function Ticket (model) {
    this.model = model || new TicketSchema();
    this.redis = app.redis;
  }


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
      name: obj.user.name
    };

    if (obj.user.avatar) user.avatar = obj.user.avatar;

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
   *  @data - A json object representing ticket properties to update
   *     :title       - string, optional
   *     :description - string, optional
   *     :status      - string, optional, available options ['open', 'closed']
   *     :assigned_to - array, optional, collection of userID's
   *
   *  @user - A user object
   *
   *  Returns an object ready to be sent to the client
   *
   *  @api public
   */

  Ticket.prototype.update = function update(data, user, cb) {
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
    if (data.description) model.description = data.description.replace(/<\/?script>/ig, '');

    // Manage assigned users
    if (data.assigned_to) {
      // if someone is assigned set read status to true
      model.read = true;

      newAssigned = _.uniq(data.assigned_to);

      this._manageSets(newAssigned, function() {
        _this._execUpdate(user.id, cb);
      });
    }
    else {
      this._execUpdate(user.id, cb);
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
   *    :cb        -  A callback to run when completed
   *
   *  returns cb(null)
   *
   *  @api private
   */

  Ticket.prototype._manageSets = function manageSets(array, cb) {
    var redis, _this, model, newArray, currentArray, exists, _add, _rem,
        error = null;

    _this = this;
    model = this.model;
    redis = this.redis;
    newArray = [];
    currentArray = [];
    _add = [];
    _rem = [];

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
        Notifications.nowParticipating(redis, user, model.id, function(err) {
          if(err) error = err;
        });
      });

      _.each(_rem, function(user) {
        redis.SREM(user, model.id);
        redis.SREM(model.id, user);

        //remove user from participating if they are removed from assigned
        Notifications.removeParticipating(redis, user, model.id, function(err) {
          if(err) error = err;
        });
      });

      return cb(error);
    });
  };


  /**
   *  execUpdate
   *
   *  Runs the save function to update a ticket after other
   *  functions have been run. Takes a callback to return the
   *  saved ticket's toClient() properties.
   *
   *    :userID - User's id in string form
   *    :cb - A callback to run
   *
   *  returns formatted ticket ready to send to client
   *
   *  @api private
   */

  Ticket.prototype._execUpdate = function execUpdate(userID, cb) {
    var _this, model, obj, redis;

    _this = this;
    model = this.model;
    redis = this.redis;
    model.modified_at = Date.now();

    model.save(function(err, ticket) {
      if (err || !ticket) {
        return cb('Error updating model. Check required attributes.');
      }
      else {
        obj = new Ticket(ticket);

        obj._toClient(function(err, ticket){
          if(err) return cb(err);

          //If toClient was successful, push a notification and emit a ticket:update event
          Notifications.pushNotification(redis, userID, ticket.id, function(err) {
            if(err) return cb(err);

            app.eventEmitter.emit('ticket:update', ticket);
            return cb(null, ticket);
          });
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

  Ticket.prototype.remove = function remove(cb) {
    var ticket = this.model;

    ticket.remove(function(err) {
      if (err) return cb(err);
      return cb(null, "ok");
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

  Ticket.all = function all(args, cb) {
    var query, array, count, _i, obj;

    if(args.status) {
      query = TicketSchema.find({'status': args.status});
      if (args.status === 'open') {
        query.asc('opened_at');
      }
      else {
        query.desc('closed_at');
      }
    }
    else {
      query = TicketSchema.find();
    }

    if(args.page) {
      query.skip((args.page - 1) * 10);
      query.limit(10);
    }

    query
    .populate('user')
    .run(function(err, models){
      if(err) {
        return cb("Error finding tickets");
      }
      else {
        array = [];
        _i = 0;
        count = models.length;

        // return empty array if no tickets
        if(count === 0) return cb(null, []);

        while(_i < count) {
          obj = new Ticket(models[_i]);

          obj._toClient(function(err, model) {
            if (err) return cb(err);
            array.push(model);
            if(array.length === count) {
              return cb(null, array);
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

  Ticket.mine = function mine(user, status, page, cb) {
    var _this, redis, obj, query, array, count, _i;

    _this = this;
    redis = app.redis;

    redis.SMEMBERS(user, function(err, res){
      query = TicketSchema
      .where('_id')
      .in(res)
      .where('status', status);

      if(status === 'open') {
        query.asc('opened_at');
      }
      else {
        query.desc('closed_at');
      }

      query
      .populate('user')
      .skip((page - 1) * 10)
      .limit(10)
      .run(function(err, models) {
        if(err) {
          return cb("Error finding tickets");
        }
        else {
          array = [];
          _i = 0;
          count = models.length;

          // return empty array if no tickets
          if(count === 0) return cb(null, []);

          while(_i < count) {
            obj = new Ticket(models[_i]);
            obj._toClient(function(err, model) {
              if (err) return cb(err);

              array.push(model);

              if(array.length === count) {
                return cb(null, array);
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

  Ticket.find = function find(id, cb) {
    var _this, obj;

    TicketSchema
    .findOne({'_id':id})
    .populate('user')
    .run(function(err, model) {
      if(err || !model){
        return cb("Error finding ticket");
      }
      else {
        obj = new Ticket(model);

        obj._toClient(function(err, ticket){
          if(err) return cb(err);
          return cb(null, ticket);
        });
      }
    });
  };


  /**
   *  create
   *
   *  Creates a new ticket with the status of "open"
   *
   *  @data - A json object representing ticket properties
   *     :title       - string
   *     :description - string, remove any possible script tags
   *     :user        - string, a user instance BSON id
   *
   *  @user - A user object
   *
   *  Returns a ticket object ready to be sent to the client.
   *
   *  @api public
   */

  Ticket.create = function create(data, user, cb) {
    var ticket, klass, assigned_to;

    ticket = new TicketSchema({
      title: data.title,
      description: data.description,
      user: data.user
    });

    if (ticket.description) ticket.description.replace(/<\/?script>/ig, '');

    // Check if user is admin and automatically assign them if true
    if(user.role && user.role === 'admin') {
      assigned_to = [user._id];
      ticket.read = true;

      klass = new Ticket(ticket);

      klass._manageSets(assigned_to, function() {
        createTicketObject(ticket, data, cb);
      });
    }
    else {
      createTicketObject(ticket, data, cb);
    }
  };

  // Perform the actual I/O in seperate function
  function createTicketObject(ticket, data, cb) {
    var redis = app.redis;

    ticket.save(function(err, ticket) {
      if (err || !ticket) {
        return cb(err);
      }
      else {
        // Run find() to ensure new ticket is populated
        Ticket.find(ticket._id, function(err, model){
          if(err) return cb(err);

          Notifications.nowParticipating(redis, ticket.user, ticket.id, function(err) {
            if(err) return cb(err);

            //Build model to emit
            obj = { body: model };
            // If data came from client include socket id
            if (data.socket) { obj.socket = data.socket; }

            // Emit a 'ticket:new' event
            app.eventEmitter.emit('ticket:new', obj);
            return cb(null, model);
          });
        });
      }
    });
  }

  return Ticket;

};

