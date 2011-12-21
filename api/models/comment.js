var mongoose = require("mongoose"),
    User = mongoose.model('User'),
    _ = require('underscore');

var Comment = new mongoose.Schema({
  comment           : {type : String, default : '', required: true, trim: true},
  created_at        : {type : Date, default : Date.now(), required: true},
  modified_at       : {type : Date, default : Date.now, set: Date.now, required: true},
  user              : {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
});


/* ---------------------------------------- *
 * Instance Methods *
 * ---------------------------------------- */


/* To Client *
*
*  Returns an object for use with client-side js.
*  Sets the mongo _id property name to id */
Comment.methods.toClient = function(){
  var obj = this.toObject();
  obj.id = obj._id;
  obj.user.id = obj.user._id;
  delete obj._id;
  delete obj.user._id;
  return obj
};


/* Update Comment *
*
*  data - A json object representing ticket properties to update
*          :comment  - string, optional
*
*  Updates a comment and returns a comment object
*  ready to be sent to the client. */
Comment.methods.update = function(ticket, data, callback) {
  if (data.comment) this.comment = data.comment;
  ticket.save(function(err, model) {
    if(err || !model) callback("Error updating ticket");
    return callback(null, model.toClient());
  });
}


/* Delete Comment *
*
*  Removes a comment from a ticket.
*  Returns an error or status "ok" to the callback */
Comment.methods.removeComment = function(ticket, callback) {
  this.remove();
  ticket.save(function(err) {
    if (err) return callback('Error removing comment');
    return callback(null, "ok");
  });
}


/* ---------------------------------------- *
 * Static Methods *
 * ---------------------------------------- */


/* Return All Comments
*
*  :comments - array, an array of a tickets comment objects
*
*  Returns an array of all a ticket's comments cleaned
*  and ready to be sent to the client. */
Comment.statics.getAll = function(comments, callback) {
  var array = [];
  _.each(comments, function(comment) {
    var obj = comment.toClient();
    array.push(obj);
  });
  return callback(null, array);
}


/* Return A Single Comment
*
*  :ticket  - a ticket object
*  :id      - string, a comments BSON id
*
*  Return a single ticket comment object ready to be sent to the client */
Comment.statics.getSingle = function(ticket, id, callback) {
  var comment = ticket.comments.id(id);
  if (!comment) return callback("Comment not found");
  callback(null, comment.toClient());
}


/* Create A Comment *
*
*  ticket - a ticket object
*  data - A json object representing a ticket
*        :comment   - string
*        :user      - string, a user's BSON id in string form
*
*  Creates a new comment
*  Returns a comment object ready to be sent to the client. */
Comment.statics.create = function(ticket, data, callback) {
  var self = this;
  if(data.user) {
    User.getSingle(data.user, function(err, user) {
      if(err) return callback("Not a valid user");
      var comment = new self({
        comment: data.comment,
        user: user.id
      });
      ticket.comments.push(comment);
      ticket.save(function(err, model) {
        if (err) return callback("Error saving comment");
        var comment_data = {
          'id': comment.id,
          'comment': comment.comment,
          'created_at': comment.created_at,
          'user': user
        };
        return callback(null, comment_data);
      });
    });
  }
  else {
    callback("Not a valid user");
  }
}

exports.CommentSchema = Comment;
mongoose.model('Comment', Comment);
