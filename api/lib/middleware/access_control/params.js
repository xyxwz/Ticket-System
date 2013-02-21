"use strict";

var schemas = require('../../../models/schemas'),
    _ = require('underscore');

/* ---------------------------------------------- *
 * Pre-conditions
 * ---------------------------------------------- */

module.exports = function(route) {

  /* Find A User */
  route.param('userID', function(id, key, models, cb){
    schemas.User
    .findOne({'_id':id})
    .exec(function(err, model) {
      if(err || !model) return cb(err);
      cb(null, key, model);
    });
  });

  /* Find a project */
  route.param('projectID', function(id, key, models, cb) {
    schemas
    .Project
    .findOne({ '_id': id })
    .populate('user')
    .exec(function(err, model) {
      if(err || !model) return cb(err);
      return cb(null, key, model);
    });
  });

  /* Find a list */
  route.param('listID', function(id, key, models, cb) {
    schemas
    .List
    .findOne({ '_id': id })
    .populate('user')
    .exec(function(err, model) {
      if(err || !model) return cb(err);
      return cb(null, key, model);
    });
  });

  /* Find A Ticket */
  route.param('ticketID', function(id, key, models, cb){
    schemas.Ticket
    .findOne({'_id':id})
    .populate('user')
    .populate('comments.user')
    .exec(function(err, model){
      if(err || !model) return cb(err);
      return cb(null, key, model);
    });
  });

  /* Find A Comment */
  route.param('commentID', function(id, key, models, cb){
    var model, comment;

    model = _.find(models, function(model){
      return model[0] === 'ticketID';
    });

    if (model) {
      comment = _.find(model[1].comments, function(comment) {
        return comment._id.toString() === id.toString();
      });
      return cb(null, key, comment);
    }
    else {
      return cb(new Error('no comment exists'));
    }
  });

};
