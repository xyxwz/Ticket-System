var app = require('../../app.js'),
    mongoose = require("mongoose"),
    should = require("should"),
    _ = require('underscore'),
    User = require('../../models/user').User,
    Comment = require('../../models/comment').Comment,
    Ticket = require('../../models/ticket').Ticket;

// Hold values used in async functions
var fixtures = {
  users: [],
  tickets: []
}

// Setup and Seed Database
function setup(callback){

  // Clean Database
  var models = [User, Ticket, Comment];

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
        tickets: []
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
    addTicket(user, function(err, ticket){
      if(err) return cb(err);
      fixtures.tickets.push(ticket);
      cb(null);
    });
  });
}

// Add User
function addUser(cb){
  var user = new User({
    email: "example@example.com",
    name: "John Doe",
    department: "IT",
    access_token: "abc",
  });
  user.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

// Add Ticket
function addTicket(user, cb){
  var ticket = new Ticket({
    title: "test ticket",
    description: "a ticket to use with test",
    user: user._id
  });
  ticket.save(function(err, model){
    if(err) return cb(err);
    cb(null, model);
  });
}

exports.Setup = setup;
exports.Teardown = teardown;