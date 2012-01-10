var mongoose = require("mongoose"),
    User = mongoose.model('User'),
    _ = require('underscore');

var Comment = new mongoose.Schema({
  comment           : {type : String, default : '', required: true, trim: true},
  created_at        : {type : Date, default : Date.now, index: true, required: true},
  modified_at       : {type : Date},
  user              : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
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
  delete obj._id;

  var user = {
    id: obj.user._id,
    name: obj.user.name,
  }
  obj.user = user;

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
  var self = this;
  if (data.comment) {
    this.comment = data.comment;
    this.modified_at = Date.now();
  }
  ticket.save(function(err, model) {
    if(err || !model) callback("Error updating ticket");
    return callback(null, self.toClient());
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
*  user   - the authenticated to user (prevents a lookup)
*  data   - A json object representing a ticket
*          :comment   - string
*          :user      - string, a user's BSON id in string form (authenticated user)
*
*  Creates a new comment
*  Returns a comment object ready to be sent to the client. */
Comment.statics.create = function(ticket, user, data, callback) {
  var self = this;
  var comment = new self({
    comment: data.comment,
    user: data.user
  });
  ticket.comments.push(comment);
  ticket.save(function(err, model) {
    if (err) return callback("Error saving comment");
    // build client data to prevent looking up and populating user & comment
    var comment_data = {
      'id': comment.id,
      'comment': comment.comment,
      'created_at': comment.created_at,
      'user': user.toObject(),
    };
    comment_data.user.id = comment_data.user._id;
    delete comment_data.user._id;
    delete comment_data.user.access_token;
    return callback(null, comment_data);
  });
}

exports.CommentSchema = Comment;
exports.Comment = mongoose.model('Comment', Comment);
