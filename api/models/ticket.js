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
    var self = this,
        obj, user, namespace;

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

    // Get the Ticket's Assigned_to and Participants
    async.parallel([
      function(callback) {
        self.redis.SMEMBERS('ticket:' + obj.id + ':assignees', function(err, members) {
          if(err) return cb(err);
          obj.assigned_to = members;
          callback(null, obj);
        });
      },
      function(callback) {
        self.redis.SMEMBERS('ticket:' + obj.id + ':participating', function(err, members) {
          if(err) return cb(err);
          obj.participants = members;
          callback(null, obj);
        });
      }
    ], function(err, results) {
      cb(err, obj);
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
    var self = this,
        model = this.model;

    if (data.status) {
      if(model.status === "open" && data.status === "closed") {
        model.closed_at = Date.now();
      }
      model.status = data.status;
    }

    if (data.title) model.title = data.title;
    if (data.description) model.description = data.description.replace(/<\/?script>/ig, '');

    async.parallel([
      // Set Participants Array in Redis
      function(callback) {
        if(!data.participants) return callback(null);

        Notifications.resetParticipating(self.redis, data.participants, model.id, function(err) {
          callback(err);
        });
      },

      // Manage Assigned User
      function(callback) {
        if(!data.assigned_to) return callback(null);
        self._manageAssigned(data.assigned_to, function() {
          callback(null);
        });
      }

    ], function(err) {
      // Save Ticket
      model.modified_at = Date.now();
      model.save(function(err, ticket) {
        if (err || !ticket) return cb('Error updating model. Check required attributes.');
        var obj = new Ticket(ticket);
        obj._toClient(function(err, ticket){
          if(err) return cb(err);

          // Build model to emit
          var obj = { body: ticket };

          // If toClient was successful, push a notification and emit a ticket:update event
          Notifications.pushNotification(self.redis, user._id, ticket.id, function(err) {
            if(err) return cb(err);
            app.eventEmitter.emit('ticket:update', obj);
            return cb(null, ticket);
          });
        });
      });
    });
  };


  /**
   * manageAssigned
   *  Add an array of users to the ticket's assignees redis set
   *
   * @param {Array} array used to maintain backwards compatability
   * @param {Function} callback
   * @api private
   */

  Ticket.prototype._manageAssigned = function manageAssigned(array, callback) {
    var redis = this.redis,
        model = this.model,
        ticketNamespace = 'ticket:' + model.id + ':assignees';

    if(array.length) {
      model.read = true;
    } else {
      model.read = false;
    }

    // Wipe the assignees set prior to assigning the new user
    redis.DEL(ticketNamespace, function(err) {
      if(err) return callback(err);
      redis.SADD(ticketNamespace, array, function(err) {
        if(err) return callback(err);
        Notifications.nowParticipating(redis, array[0], model.id, function(err) {
          callback(err);
        });
      });
    });
  };


  /*
   * Remove the ticket's assignees set and ticket reference from
   * users assignedto set in redis
   *
   * @param {Function} cb
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

        // This is left to maintain backwards compatability, and delete any old sets
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

  Ticket.all = function all(user, args, callback) {
    var query = TicketSchema.find();

    // Check Status
    if(args.status) {
      query.where('status', args.status);
      var sort = args.status === 'open' ? 'opened_at' : '-closed_at';
      query.sort(sort);
    }

    // Optional read status
    if(typeof args.read !== 'undefined') {
      query.where('read', args.read);
    }

    // Check Pagination
    if(args.page) {
      query.skip((args.page - 1) * 10);
      query.limit(10);
    }

    query
    .populate('user')
    .exec(function(err, models) {
      if(err) return cb(new Error("Error finding tickets"));
      if(models.length === 0) return callback(null, []);
      var tickets = [];

      async.forEachSeries(models, checkFlags, function(err) {
        if(err) return callback(err);
        return callback(null, tickets);
      });

      function checkFlags(model, callback) {
        var obj = new Ticket(model);
        obj._toClient(function(err, item) {

          // Don't check participating or notifications for closed tickets
          if(args.status === 'closed') {
            tickets.push(item);
            return callback(null);
          }

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
    var ticket, klass;

    ticket = new TicketSchema({
      title: data.title,
      description: data.description,
      user: data.user
    });

    if (ticket.description) ticket.description.replace(/<\/?script>/ig, '');

    Notifications.nowParticipating(app.redis, user._id, ticket.id, function(err) {
      if(err) return cb(err);
      createTicketObject(ticket, data, cb);
    });
  };

  /**
   * Allow a User to follow and unfollow updates on a Ticket
   *
   * @user - A User ID
   * @model - A Ticket ID
   * @callback - A callback to run
   *
   * @api Public
   */

  Ticket.follow = function follow(user, model, callback) {
    Notifications.nowParticipating(app.redis, user, model, function(err, status) {
      Ticket.find(model, function(err, ticket) {
        app.eventEmitter.emit('ticket:update', { body: ticket });
        return callback(err, !!status);
      });
    });
  };

  Ticket.unfollow = function unfollow(user, model, callback) {
    Notifications.removeParticipating(app.redis, user, model, function(err, status) {
      Ticket.find(model, function(err, ticket) {
        app.eventEmitter.emit('ticket:update', { body: ticket });
        return callback(err, !!status);
      });
    });
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

