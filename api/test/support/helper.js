var mongoose = require("mongoose"),
    should = require("should"),
    _ = require('underscore'),
    User = require('../../models/user').User,
    Comment = require('../../models/comment').Comment,
    Ticket = require('../../models/ticket').Ticket;

// Hold values used in async functions
var fixtures = {
  users: [],
  tickets: [],
  comments: []
}

// Setup and Seed Database
function setup(callback){

  // Clean Database
  var models = [User, Ticket];

  var model, modelCount, _i, _len;
  modelCount = models.length;
  for (_i = 0, _len = models.length; _i < _len; _i++) {
    model = models[_i];
    modelCount--;
    model.collection.drop(function(err) {});
    if (modelCount === 0) {
      seedDatabase(function(err){
        if(err) return callback(err);
        callback(null, fixtures); 
      });
    }
  }
}

// Teardown Database
function teardown(callback){

  // Clean Database
  var models = [User, Ticket, Comment];

  var model, modelCount, _i, _len;
  modelCount = models.length;
  for (_i = 0, _len = models.length; _i < _len; _i++) {
    model = models[_i];
    modelCount--;
    model.collection.drop(function(err) {});
    if (modelCount === 0) {
      fixtures = {
        users: [],
        tickets: [],
        comments: []
      }
      callback(null); 
    }
  }
}

// Seed Database
function seedDatabase(cb){
  addUser(function(err, user){
    if(err) return cb(err);
    fixtures.users.push(user);
    addTickets(user, function(err, tickets){
      if(err) return cb(err);
      _.each(tickets, function(ticket){
        fixtures.tickets.push(ticket);
      });
      addComment(tickets[0], user, function(err, comment){
        if(err) return cb(err);
        fixtures.comments.push(comment);
        cb(null);
      });
    });
  });
}

// Add User
function addUser(cb){
  var user = new User({
    email: "example@example.com",
    name: "John Doe",
    role: "member",
    access_token: "abc",
  });
  user.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Ticket
function addTickets(user, cb){
  var i = 1, array = [];
  while(i <= 4) {
    if(i % 2 == 0) {
      addOpenTicket(user, i, function(err, model) {
        array.push(model);
        if (array.length == 4) {
          cb(null, array);
        }
      });
    }
    else {
      addClosedTicket(user, i, function(err, model) {
        array.push(model);
        if (array.length == 4) {
          cb(null, array);
        }
      });
    }
    i++;
  }
}

// Add Open Ticket
function addOpenTicket(user, i, cb){
  var ticket = new Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user._id,
    status: 'open'
  });
  ticket.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Closed Ticket
function addClosedTicket(user, i, cb){
  var ticket = new Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user._id,
    status: 'closed',
    closed_at: Date.now()
  });
  ticket.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Comment
function addComment(ticket,user, cb){
  var comment = new Comment({
    comment: "test comment",
    user: user._id
  });
  ticket.comments.push(comment);
  ticket.save(function(err, model) {
    if (err) return cb(err);
    return cb(null, model.comments.id(comment.id));
  });
}

exports.Setup = setup;
exports.Teardown = teardown;