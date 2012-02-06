var should = require("should"),
    _ = require('underscore'),
    helper = require('../support/helper'),
    redis = ('redis'),
    app = require('../support/bootstrap').app,
    mongoose = require("mongoose");

var server = app(),
    Ticket = require('../../models/ticket')(server);

/* Ticket Model Unit Tests */

describe('ticket', function(){

  // Hold values used in async hooks
  var fixtures;

  before(function(done){
    helper.Setup(server, function(err, data){
      if(err) return done(err);
      fixtures = data;
      done();
    });
  });

  after(function(done){
    helper.Teardown(server, function(err){
      if(err) return done(err);
      fixtures = {};
      done();
    });
  });

  /* Validations */
  describe('validations', function(){

    describe('required fields', function(){

      it("should enforce required fields", function(done){
        Ticket.create({}, {}, function(err){
          // Title
          should.exist(err.errors.title);
          err.errors.title.type.should.equal("required");
          // Description
          should.exist(err.errors.description);
          err.errors.description.type.should.equal("required");
          // User
          should.exist(err.errors.user);
          err.errors.user.type.should.equal("required");
          done();
        });
      });
    });

  }); // close validations

  /* ------------------------------- *
   * Instance Methods
   * ------------------------------- */
  describe('instance methods', function(){

    /* To Client */
    /* Should test the object is ready to be sent to the client */
    describe('toClient', function(){
      var klass, ticket;

      before(function(done){
        klass = new Ticket(fixtures.tickets[0]);

        klass._toClient(function(err, obj){
          if(err) return done(err);
          ticket = obj;
          done();
        });
      });

      it('should strip out user access token', function(){
        should.not.exist(ticket.user.access_token);
      });

      it('should strip out embedded comments', function(){
        should.not.exist(ticket.comments);
      });

      it('should rename _id property to id', function(){
        should.not.exist(ticket._id);
        should.exist(ticket.id);
      });

      it('should include an assigned_to property', function(){
        should.exist(ticket.assigned_to);
      });
    });


    /* Update */
    /* Should test the update method follows the correct rules */
    describe('update', function(){
      var klass, data, testObject, origTitle;

      before(function(done){
        klass = new Ticket(fixtures.tickets[0]);

        origTitle = fixtures.tickets[0].title;

        data = {
          title: "title UPDATED",
          description: "description UPDATED",
          status: "closed"
        };

        var user = fixtures.users[0];

        klass.update(data, user, function(err, model){
          if(err) return done(err);
          testObject = model;
          done();
        });
      });

      // Reset Title for future tests
      after(function(done){
        var user = fixtures.users[0];
        klass.update({title: origTitle}, user, function(err, model){
          if(err) return done(err);
          done();
        });
      });

      it('should update required fields', function(){
        testObject.title.should.equal("title UPDATED");
        testObject.description.should.equal("description UPDATED");
        testObject.status.should.equal("closed");
      });

      it('should set closed_at', function(){
        should.exist(testObject.closed_at);
      });

      it('should set modified_at time', function(){
        should.exist(testObject.modified_at);
        testObject.modified_at.should.not.equal(testObject.opened_at);
      });
    });

    /* Update - assigning users
     * Should test assigning users to a ticket works correctly */
    describe('update - assign users', function(){
      var klass, data, testObject;

      before(function(done){
        klass = new Ticket(fixtures.tickets[0]);

        data = {
          assigned_to: [fixtures.users[0].id, fixtures.users[0].id]
        };

        var user = fixtures.users[0];

        klass.update(data, user, function(err, model){
          if(err) return done(err);
          testObject = model;
          done();
        });
      });

      it('should assign user to ticket', function(){
        var assignedTo = testObject.assigned_to[0].toString();
        assignedTo.should.equal(fixtures.users[0].id);
      });

      it('should strip out duplicate ids', function(){
        testObject.assigned_to.length.should.equal(1);
      });

      it('should set read to true because we are assigning users', function(){
        testObject.read.should.be.true;
      });
    });


    /* Manage Sets */
    /* Should manage the assigned_to redis sets */
    describe('manageSets', function(){
      var client, klass, data, ticket, user1, user2;

      before(function(done){
        client = server.redis;

        /* clear out previous assigned_to's to
         * only test manageSets() */
        klass = new Ticket(fixtures.tickets[0]);

        data = {assigned_to: []};

        var user = fixtures.users[0];

        klass.update(data, user, function(err, model){
          if(err) return done(err);
          user1 = fixtures.users[0].id;
          user2 = fixtures.users[1].id;
          done();
        });
      });

      describe('addUsers', function(){

        before(function(done){
          klass._manageSets([user1, user2], function(){
            done();
          });
        });

        it('should set ticket assigned_to list', function(done){
          var ticketNamespace = 'ticket:' + klass.model.id + ':assignees';

          client.SMEMBERS(ticketNamespace, function(err, res){
            res.length.should.equal(2);
            done();
          });
        });

        it('should add a ticket to each users set', function(done){
          var user1_namespace = 'user:' + user1 + ':assignedTo',
              user2_namespace = 'user:' + user2 + ':assignedTo';

          client.SMEMBERS(user1_namespace, function(err, res){
            res.length.should.equal(1);
            client.SMEMBERS(user2_namespace, function(err, res){
              res.length.should.equal(1);
              done();
            });
          });
        });

      }); // close addUsers

      describe('removeUsers', function(){

        before(function(done){
          klass._manageSets([user1], function(){
            done();
          });
        });

        it('should set ticket assigned_to list', function(done){
          var ticketNamespace = 'ticket:' + klass.model.id + ':assignees';

          client.SMEMBERS(ticketNamespace, function(err, res){
            res.length.should.equal(1);
            done();
          });
        });

        it('should remove ticket from user2 set', function(done){
          var user1_namespace = 'user:' + user1 + ':assignedTo',
              user2_namespace = 'user:' + user2 + ':assignedTo';

          client.smembers(user1_namespace, function(err, res){
            res.length.should.equal(1);
            client.smembers(user2_namespace, function(err, res){
              res.length.should.equal(0);
              done();
            });
          });
        });

      }); // close removeUsers

    }); // close manageSets


    /* Remove */
    /* Should test a ticket can be successfully removed */
    describe('removeTicket', function(){
      var data, klass, result;

      before(function(done){
        klass = new Ticket(fixtures.tickets[0]);

        klass.remove(function(err, status){
          if(err) return done(err);
          result = status;
          done();
        });
      });

      it('should destroy a ticket', function(done){
        Ticket.find(klass.id, function(err, ticket){
          should.not.exist(ticket);
          done();
        });
      });

      it('should return a status of "ok"', function(){
        result.should.equal('ok');
      });
    });

  }); // close instance methods


  /* ------------------------------- *
   * Static Methods
   * ------------------------------- */
  describe('static methods', function(){

    /* --------------------
     * All
     * -------------------- */

    /* Get All Open Tickets */
    /* Should return an array of tickets */
    describe('all Open', function(){
      var models;

      // Run get all and assign to users
      before(function(done){
        Ticket.all({status:'open', page: 1}, function(err, results){
          if(err) return done(err);
          models = results;
          done();
        });
      });

      it('should return an array', function(){
        models.should.be.an.instanceof(Array);
        models.length.should.equal(2);
      });

      it('should sort by created_at', function(){
        models[0].title.should.equal('test ticket 2');
        models[1].title.should.equal('test ticket 4');
      });

      it('should run toClient() on ticket instances', function(){
        should.not.exist(models[0]._id);
        should.exist(models[0].id);
      });
    });

    /* Get All Closed Tickets */
    /* Should return an array of tickets */
    describe('all Closed', function(){
      var models;

      // Run get all and assign to users
      before(function(done){
        Ticket.all({status: 'closed', page: 1}, function(err, results){
          if(err) return done(err);
          models = results;
          done();
        });
      });

      it('should return an array', function(){
        models.should.be.an.instanceof(Array);
        models.length.should.equal(2);
      });

      it('should sort by closed_at', function(){
        models[0].title.should.equal('test ticket 5');
        models[1].title.should.equal('test ticket 3');
      });

      it('should run toClient() on ticket instances', function(){
        should.not.exist(models[0]._id);
        should.exist(models[0].id);
      });
    });

    /* mine
     * Should return an array of tickets assigned to
     * a given user */
    describe('mine', function(){

      before(function(done){
        var data, _i, count, klass, user;

        data = {assigned_to: [fixtures.users[0].id, fixtures.users[1].id]};
        _i = 0;
        count = 0;

        user = fixtures.users[0];

        _.each(fixtures.tickets, function(ticket){
          klass = new Ticket(ticket);

          klass.update(data, user, function(err, ticket){
            count++;
            if(count == fixtures.tickets.length){
              done();
            }
          });
          _i++;
        });
      });

      it('should return open tickets assigned to user', function(done){
        Ticket.mine(fixtures.users[0]._id, 'open', 1, function(err, models){
          models.length.should.equal(2);
          done();
        });
      });

      it('should return closed tickets assigned to user', function(done){
        Ticket.mine(fixtures.users[0]._id, 'closed', 1, function(err, models){
          models.length.should.equal(2);
          done();
        });
      });

    });


    /* getSingle */
    /* Should test a single ticket is returned */
    describe('getSingle', function(){
      var ticket;

      // Run getSingle and assign result to user
      before(function(done){
        Ticket.find(fixtures.tickets[3]._id, function(err, model){
          if(err) return done(err);
          ticket = model;
          done();
        });
      });

      it('should return a ticket object', function(){
        ticket.title.should.equal('test ticket 4');
        should.not.exist(ticket.user._id);
        should.not.exist(ticket.user.access_token);
        should.exist(ticket.user.id);
      });
    });


    /* create */
    /* Should add a ticket to the database */
    describe('create - non admin', function(){
      var data, result, events = [];

      before(function(done){
        data = {
          title: "create ticket",
          description: "create description",
          user: fixtures.users[0]._id
        };

        var user = fixtures.users[1];

        // Bind an event listener
        server.eventEmitter.on('ticket:new', function(event) {
          events.push(event);
        });

        Ticket.create(data, user, function(err, ticket){
          result = ticket;
          done();
        });
      });


      it('should successfully create a ticket', function(done){
        // Perform a query to ensure ticket is inserted
        Ticket.find(result.id, function(err, model){
          model.title.should.equal(result.title);
          done();
        });
      });

      it('should set opened_at date', function(){
        should.exist(result.opened_at);
        should.not.exist(result.modified_at);
        should.not.exist(result.closed_at);
      });

      it('should err if validations fail', function(done){
        data.title = null;
        Ticket.create(data, {}, function(err, ticket){
          should.exist(err);
          done();
        });
      });

      it('should emit a ticket:new event', function() {
        events.length.should.equal(1);
      });
    });

    /* create */
    /* Should add a ticket to the database */
    describe('create - admin', function(){
      var data, result, events = [];

      before(function(done){
        var obj = {
          title: "create ticket",
          description: "create description",
          user: fixtures.users[0]._id
        };
        data = obj;

        var user = fixtures.users[0];

        Ticket.create(data, user, function(err, ticket){
          result = ticket;
          done();
        });
      });

      it('should assign admin user to ticket', function(){
        var assignedTo = result.assigned_to[0].toString();
        assignedTo.should.equal(fixtures.users[0].id);
      });

      it('should set read to true because we are assigning users', function(){
        result.read.should.be.true;
      });
    });

  }); // close static methods

});
