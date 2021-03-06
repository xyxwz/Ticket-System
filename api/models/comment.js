var mongoose = require("mongoose"),
    _ = require('underscore'),
    CommentSchema = require('./schemas/comment').Comment,
    Notifications = require('./helpers/').Notifications;


module.exports = function(app) {


  function Comment (model, parent) {
    this.model = model || new CommentSchema();
    this.ticket = parent || null;
  }


  /**
   *  toClient
   *
   *  Sets the mongo _id property name to id
   *
   *  Returns an object for use with client-side js.
   *
   *  @api private
   */

  Comment.prototype._toClient = function toClient() {
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

    return obj;
  };


  /**
   *  update
   *
   *  Updates a comment
   *
   *  data - A json object representing ticket properties to update
   *          :comment  - string, optional
   *
   *  Returns a comment object ready to be sent to the client.
   *
   *  @api public
   */

  Comment.prototype.update = function update(data, cb) {
    var _this, ticket, model;

    _this = this;
    ticket = this.ticket;
    model = this.model;

    if (data.comment) {
      model.comment = data.comment.replace(/<\/?script>/ig, '');
      model.modified_at = Date.now();
    }

    ticket.save(function(err, obj) {
      if(err || !obj) cb(err);

      var clientObj = _this._toClient();

      var emitObj = {body: clientObj};
      emitObj.ticket = ticket.id;
      app.eventEmitter.emit('comment:update', emitObj);

      return cb(null, clientObj);
    });
  };


  /**
   *  remove
   *
   *  Removes a comment from a ticket.
   *
   *  Returns an error or status "ok" to the callback
   *
   *  @api public
   */

  Comment.prototype.remove = function remove(cb) {
    var ticket,
        model,
        obj = {};

    ticket = this.ticket;
    model = this.model;

    model.remove();
    ticket.save(function(err) {
      if (err) return cb('Error removing comment');

      obj.ticket = ticket.id;
      obj.comment = model.id;

      app.eventEmitter.emit('comment:remove', obj);

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
   *  Gets all the comments attached to a ticket
   *
   *  :comments - array, an array of a tickets comment objects
   *
   *  Returns an array of all a ticket's comments cleaned
   *  and ready to be sent to the client.
   *
   *  @api public
   */

  Comment.all = function all(comments, cb) {
    var array, klass, obj;

    array = [];

    _.each(comments, function(comment) {
      klass = new Comment(comment);
      obj = klass._toClient();
      array.push(obj);
    });

    return cb(null, array);
  };


  /**
   *  find
   *
   *  Get A Single Comment
   *
   *  :ticket  - a ticket object
   *  :id      - string, a comments BSON id
   *
   *  Returns a single ticket comment object ready to be sent to the client
   *
   *  @api public
   */

  Comment.find = function find(comments, id, cb) {
    var comment, klass;

    comment = _.find(comments, function(comment) {
      return comment.id === id;
    });

    if (!comment) return cb("Comment not found");

    klass = new Comment(comment);
    cb(null, klass._toClient());
  };


  /**
   *  create
   *
   *  Creates a new comment
   *
   *  :ticket - a ticket object
   *  :user   - the authenticated user id (prevents a lookup)
   *  :data   - A json object representing a ticket
   *            :comment   - string
   *            :user      - string, a user's BSON id in string form (authenticated user)
   *
   *  Returns a comment object ready to be sent to the client.
   */

  Comment.create = function(ticket, user, data, cb) {
    var comment, obj, redis;

    redis = app.redis;

    comment = new CommentSchema({
      comment: data.comment,
      user: data.user
    });

    if(comment.comment) comment.comment.replace(/<\/?script>/ig, '');

    ticket.comments.push(comment);

    ticket.save(function(err, model) {
      if (err) return cb(err);

      // build client data to prevent looking up and populating user & comment
      obj = {
        id: comment.id,
        comment: comment.comment,
        created_at: comment.created_at,
        user: {
          id: user._id,
          name: user.name
        }
      };

      if (user.avatar) obj.user.avatar = user.avatar;

      Notifications.nowParticipating(redis, user._id, ticket.id, function(err) {
        Notifications.pushNotification(redis, user._id, ticket.id, function(err) {
          if(err) return cb(err);

          var emitObj = {body: obj};
          emitObj.ticket = ticket.id;
          app.eventEmitter.emit('comment:new', emitObj);

          return cb(null, obj);
        });
      });
    });
  };

  return Comment;

};
