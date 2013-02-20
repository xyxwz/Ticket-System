var schemas = require('../../models/schemas'),
    async = require('async');


// Hold values used in async functions
var fixtures;

// Setup and Seed Database
function setup(server, callback) {
  server.redis.FLUSHDB();

  async.series([
    flushFixtures,
    seedDatabase
  ],
  function(err) {
    if(err) return callback(err);
    return callback(null, fixtures);
  });
}

// Teardown Database
function teardown(server, callback) {
  server.redis.FLUSHDB();

  flushFixtures(function(err) {
    if(err) return callback(err);
    return callback(null);
  });
}

// Flush our database fixtures and object
function flushFixtures(callback) {
  fixtures = {
    users: [],
    projects: [],
    tickets: [],
    comments: [],
    lists: []
  };

  async.parallel([
    function(callback) {
      schemas.Ticket.collection.drop(function() { callback(null); });
    },
    function(callback) {
      schemas.Project.collection.drop(function() { callback(null); });
    },
    function(callback) {
      schemas.User.collection.drop(function() { callback(null); });
    },
    function(callback) {
      schemas.List.collection.drop(function() { callback(null); });
    }
  ],
  function(err) {
    if(err) return callback(err);
    return callback(null);
  });
}

// Seed Database
function seedDatabase(cb){
  async.series([
    addUsers,
    addTickets,
    addProjects,
    addComment,
    addLists
  ],
  function(err) {
    if(err) return cb(err);
    return cb(null);
  });
}

// Add Multiple Users
function addUsers(cb) {
  var i = 0;

  async.whilst(
    function() { return i < 2; },
    function(callback) {
      addUser(i, function(err, model) {
        if(err) return callback(err);
        fixtures.users.push(model);
        return callback(null);
      });

      i++;
    },
    function(err) {
      if(err) return cb(err);
      return cb(null);
    }
  );
}

// Add User
function addUser(i, cb){
  var user = new schemas.User({
    username: "example_"+i,
    name: "John Doe",
    role: "member",
    access_token: "abc"+i,
    refresh_token: "abc"+i
  });

  // Set the first user to an admin role
  if(i === 0) user.role = 'admin';

  user.save(function(err, model) {
    if(err) return cb(err);
    return cb(null, model);
  });
}

// Add 5 Tickets to the collection
function addTickets(cb){
  var i = 1,
      user = fixtures.users[0];

  async.whilst(
    function() { return i <= 5; },
    function(callback) {
      if(i % 2 === 0) {
        addOpenTicket(user, i, function(err, model) {
          if(err) return callback(err);
          fixtures.tickets.push(model);
          return callback(null);
        });
      }
      else {
        addClosedTicket(user, i, function(err, model) {
          if(err) return callback(err);
          fixtures.tickets.push(model);
          return callback(null);
        });
      }

      i++;
    },
    function(err) {
      if(err) return cb(err);
      return cb(null);
    }
  );
}

// Add Open Ticket
function addOpenTicket(user, i, cb) {
  var ticket = new schemas.Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user.id,
    status: 'open'
  });

  ticket.save(function(err, model) {
    schemas.Ticket
    .findOne({ _id: model._id })
    .populate('user')
    .run(function(err, model){
      if(err) return cb(err);
      return cb(null, model);
    });
  });
}

// Add Closed Ticket
function addClosedTicket(user, i, cb) {
  var ticket = new schemas.Ticket({
    title: "test ticket " + i,
    description: "a ticket to use with test",
    user: user.id,
    status: 'closed',
    closed_at: Date.now()
  });

  ticket.save(function(err, model) {
    schemas.Ticket
    .findOne({ _id: model._id })
    .populate('user')
    .run(function(err, model){
      if(err) return cb(err);
      return cb(null, model);
    });
  });
}

// Add Comment
function addComment(cb) {
  var ticket = fixtures.tickets[0],
      user = fixtures.users[0],
      comment = new schemas.Comment({
        comment: "test comment",
        user: user._id
      });

  ticket.comments.push(comment);
  ticket.save(function(err, model) {
    if(err) return cb(err);
    fixtures.comments.push(model.comments.id(comment.id));
    return cb(null);
  });
}

// Add projects
function addProjects(cb) {
  var i = 0,
      user = fixtures.users[1];

  async.whilst(
    function() { return i < 2; },
    function(callback) {
      addProject(user, i, function(err, model) {
        if(err) return callback(err);
        fixtures.projects.push(model);
        return callback(null);
      });

      i++;
    },
    function(err) {
      if(err) return cb(err);
      return cb(null);
    }
  );
}

// Add Project
function addProject(user, i, callback) {
  var project = new schemas.Project({
    name: 'Test Project ' + i,
    description: 'Just a test project',
    user: user.id
  });

  project.save(function(err, model) {
    if(err) return callback(err);
    return callback(null, model);
  });
}

// Add Lists
function addLists(cb) {
  var i = 0,
      user = fixtures.users[0];

  async.whilst(
    function() { return i < 2; },
    function(callback) {
      addList(user, i, function(err, model) {
        if(err) return callback(err);
        fixtures.lists.push(model);
        return callback(null);
      });

      i++;
    },
    function(err) {
      if(err) return cb(err);
      return cb(null);
    }
  );
}

// Add Project
function addList(user, i, callback) {
  var list = new schemas.List({
    name: 'Test List ' + i,
    user: user.id,
    color: 0
  });

  list.save(function(err, model) {
    if(err) return callback(err);
    return callback(null, model);
  });
}


exports.Setup = setup;
exports.Teardown = teardown;