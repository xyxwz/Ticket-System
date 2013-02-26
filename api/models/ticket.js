var mongoose = require('mongoose'),
    redis = require('redis'),
    _ = require('underscore'),
    async = require('async'),
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
    var obj, user, namespace;

    obj = this.model.toObject();
    obj.id = obj._id;
    delete obj._id;

    if(obj.__v) delete obj.__v;

    user = {
      id: obj.user._id,
      name: obj.user.name
    };

    if (obj.user.avatar) user.avatar = obj.user.avatar;

    obj.user = user;
    delete obj.comments;

    namespace = 'ticket:' + obj.id + ':assignees';
    // Get assigned_to from redis
    this.redis.SMEMBERS(namespace, function(err, members) {
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
        _this._execUpdate(user._id, cb);
      });
    }
    else {
      this._execUpdate(user._id, cb);
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
    var redis = this.redis,
        _this = this,
        model = this.model,
        newArray = [],
        currentArray = [],
        _add = [],
        _rem = [],
        error = null,
        exists, ticketNamespace, userNamespace;

    ticketNamespace = 'ticket:' + model.id + ':assignees';

    redis.SMEMBERS(ticketNamespace, function(err, members) {

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


      // Loop through the _add array for users to assign
      _.each(_add, function(user) {
        userNamespace = 'user:' + user + ':assignedTo';

        redis.SADD(userNamespace, model.id);
        redis.SADD(ticketNamespace, user);

        // add user to ticket's now participating set
        Notifications.nowParticipating(redis, user, model.id, function(err) {
          if(err) error = err;
        });
      });

      // Loop through the _rem array for users to unassign
      // ** Don't unassign the ticket owner **
      _.each(_rem, function(user) {
        userNamespace = 'user:' + user + ':assignedTo';

        redis.SREM(userNamespace, model.id);
        redis.SREM(ticketNamespace, user);

        // don't remove ticket owner
        if(user.toString() !== _this.model.user._id.toString()) {
          // remove user from participating if they are removed from assigned
          Notifications.removeParticipating(redis, user, model.id, function(err) {
            if(err) error = err;
          });
        }
      });

      return cb(error);
    });
  };


  /*
   * Remove the ticket's assignees set and ticket reference from
   * users assignedto set in redis
   */

  Ticket.prototype._removeSets = function(cb) {
    var error,
        ticketNamespace,
        userNamespace,
        redis = this.redis,
        model = this.model;

    ticketNamespace = 'ticket:' + model.id + ':assignees';

    //Get the users assigned to the ticket
    redis.SMEMBERS(ticketNamespace, function(err, users) {
      if(err) return cb('Error looking up ticket');

      //Iterate over them and remove the ticket from their set
      users.forEach(function(user) {
        userNamespace = 'user:' + user + ':assignedTo';

        redis.SREM(userNamespace, model.id, function(err) {
          if(err) error = 'Error deleting ticket from user';
        });
      });

      //Delete the ticket key from redis
      redis.DEL(ticketNamespace, function(err) {
        if(err) error = 'Error deleting ticket';
        return cb(error, error ? false : true );
      });
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

          //Build model to emit
          var obj = { body: ticket };

          //If toClient was successful, push a notification and emit a ticket:update event
          Notifications.pushNotification(redis, userID, ticket.id, function(err) {
            if(err) return cb(err);

            app.eventEmitter.emit('ticket:update', obj);
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
    var self = this,
        ticket = this.model,
        ticketID = ticket.id;

    ticket.remove(function(err) {
      if (err) return cb(err);

      self._removeSets(function(err, status) {

        Notifications.cleanTicket(self.redis, ticketID, function(err) {
          if(err) return cb(err);

          app.eventEmitter.emit('ticket:remove', ticket.id);
          return cb(null, "ok");
        });

      });
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
    var query = TicketSchema.find();

    // Check Status
    if(args.status) {
      query.where('status', args.status);
      var sort = args.status === 'open' ? 'opened_at' : '-closed_at';
      query.sort(sort);
    }

    // Check Pagination
    if(args.page) {
      query.skip((args.page - 1) * 10);
      query.limit(10);
    }

    query
    .populate('user')
    .exec(function(err, models){
      if(err) return cb(new Error("Error finding tickets"));

      var tickets = [];

      async.forEachSeries(models, cleanTickets, function(err) {
        if(err) return callback(err);
        return cb(null, tickets);
      });

      function cleanTickets(item, callback) {
        var obj = new Ticket(item);
        obj._toClient(function(err, model) {
          if(err) return callback(err);
          tickets.push(model);
          callback(null);
        });
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

  Ticket.mine = function mine(user, args, cb) {
    async.waterfall([
      // Get all keys that match ticket:xxx:participating
      function(callback) {
	app.redis.KEYS('ticket:*:participating', function(err, keys) {
	  callback(err, keys);
        });
      },

      // Loop through all keys and check if user ID is in the array
      function(keys, callback) {
	var participating = [];

	var filter = function(item, cb) {
	  app.redis.SISMEMBER(item, user, function(err, status) {
	    if(err) return cb(err);
	    if(status) participating.push(item.split(":")[1]);
	    cb();
	  });
	};

	async.forEach(keys, filter, function(err) {
	  return callback(err, participating);
	});
      },

      // Lookup Tickets in Mongo
      function(tickets, callback) {
	var query = TicketSchema.where('_id').in(tickets);

        // Check Status
        if(args.status) {
          query.where('status', args.status);
          var sort = args.status === 'open' ? 'opened_at' : '-closed_at';
          query.sort(sort);
        }

        // Check Pagination
        if(args.page) {
          query.skip((args.page - 1) * 10);
          query.limit(10);
        }

	query.populate('user').exec(callback);
      },

      // Loop through models and set participating and notification flags
      function(models, callback) {
        if(models.length === 0) return callback(null, []);

        var tickets = [];

        async.forEachSeries(models, checkFlags, function(err) {
          if(err) return callback(err);
          return callback(null, tickets);
        });

        function checkFlags(model, callback) {
          var obj = new Ticket(model);
          obj._toClient(function(err, item) {
            checkParticipating(user, item.id, function(err, participating) {
              if(err) return callback(err);
              item.participating = participating;

              checkNotification(user, item.id, function(err, notification) {
                if(err) return callback(err);
                item.notification = notification;
                tickets.push(item);
                callback(null);
              });
            });
          });
        }
      }
    ],
    function(err, results){
      return cb(err, results);
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
    .exec(function(err, model) {
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

      klass._manageSets(assigned_to, function(err) {
        if(err) return cb(err);
        createTicketObject(ticket, data, cb);
      });
    }
    else {
      Notifications.nowParticipating(app.redis, user._id, ticket.id, function(err) {
        if(err) return cb(err);
        createTicketObject(ticket, data, cb);
      });
    }
  };

  // Perform the actual I/O in seperate function
  function createTicketObject(ticket, data, cb) {
    ticket.save(function(err, ticket) {
      if (err || !ticket) {
        return cb(err);
      }
      else {
        // Run find() to ensure new ticket is populated
        Ticket.find(ticket._id, function(err, model){
          if(err) return cb(err);

          //Build model to emit
          var obj = { body: model };

          // Emit a 'ticket:new' event
          app.eventEmitter.emit('ticket:new', obj);
          return cb(null, model);
        });
      }
    });
  }

  /**
   * Check Participating status on a model
   *
   * user {String} - User ID
   * Model {String} - Model ID
   * Callback {Function}
   */

  function checkParticipating(user, model, callback) {
    Notifications.isParticipating(app.redis, user, model, function(err, bool) {
      return callback(err, bool);
    });
  }

  /**
   * Check Notification status on a model
   *
   * user {String} - User ID
   * Model {String} - Model ID
   * Callback {Function}
   */

  function checkNotification(user, model, callback) {
    Notifications.hasNotification(app.redis, user, model, function(err, bool) {
      return callback(err, bool);
    });
  }

  return Ticket;

};

