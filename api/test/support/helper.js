var mongoose = require("mongoose"),
    should = require("should"),
    _ = require('underscore'),
    schemas = require('../../models/schemas');

// Hold values used in async functions
var fixtures = {
  users: [],
  tickets: [],
  comments: []
}

// Setup and Seed Database
function setup(callback){
  var collections, coll, collCount, _i, _len;

  // Clean Database
  collections = [schemas.User, schemas.Ticket];

  collCount = collections.length;
  for (_i = 0, _len = collections.length; _i < _len; _i++) {
    coll = collections[_i];
    collCount--;
    coll.collection.drop(function(err) {});
    if (collCount === 0) {
      seedDatabase(function(err){
        if(err) return callback(err);
        callback(null, fixtures); 
      });
    }
  }
}

// Teardown Database
function teardown(callback){
  var collections, coll, collCount, _i, _len;

  // Clean Database
  collections = [schemas.User, schemas.Ticket];

  collCount = collections.length;
  for (_i = 0, _len = collections.length; _i < _len; _i++) {
    coll = collections[_i];
    collCount--;
    coll.collection.drop(function(err) {});
    if (collCount === 0) {
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
  addUsers(function(err, users){
    if(err) return cb(err);
    addTickets(users[0], function(err, tickets){
      if(err) return cb(err);
      addComment(tickets[0], users[0], function(err, comment){
        if(err) return cb(err);
        fixtures.comments.push(comment);
        cb(null);
      });
    });
  });
}

// Add Multiple Users
function addUsers(cb) {
  var i = 0;
  while(i < 2) {
    addUser(i, function(err, model) {
      fixtures.users.push(model)
      if(fixtures.users.length == 2) {
        cb(null, fixtures.users);
      }
    });
    i++;
  }
}

// Add User
function addUser(i, cb){
  var user = new schemas.User({
    email: "example_"+i+"@example.com",
    name: "John Doe",
    role: "member",
    access_token: "abc"+i,
  });
  user.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Ticket
function addTickets(user, cb){
  var i = 1;
  while(i <= 5) {
    if(i % 2 == 0) {
      addOpenTicket(user, i, function(err, model) {
        fixtures.tickets.push(model);
        if (fixtures.tickets.length == 4) {
          cb(null, fixtures.tickets);
        }
      });
    }
    else {
      addClosedTicket(user, i, function(err, model) {
        fixtures.tickets.push(model);
        if (fixtures.tickets.length == 4) {
          cb(null, fixtures.tickets);
        }
      });
    }
    i++;
  }
}

// Add Open Ticket
function addOpenTicket(user, i, cb){
  var ticket = new schemas.Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user.id,
    status: 'open',
  });
  ticket.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Closed Ticket
function addClosedTicket(user, i, cb){
  var ticket = new schemas.Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user.id,
    status: 'closed',
    closed_at: Date.now()
  });
  var dt = new Date();
  while ((new Date()) - dt <= 100) {}
  ticket.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Comment
function addComment(ticket,user, cb){
  var comment = new schemas.Comment({
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