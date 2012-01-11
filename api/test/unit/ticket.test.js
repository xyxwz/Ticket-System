var should = require("should"),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app,
    mongoose = require("mongoose"),
    Ticket = require('../../models/ticket').Ticket;

var server = app();

/* Ticket Model Unit Tests */

describe('ticket', function(){

  // Hold values used in async hooks
  var fixtures;

  before(function(done){
    helper.Setup(function(err, data){
      if(err) return done(err);
      fixtures = data;
      done();
    });
  });

  after(function(done){
    helper.Teardown(function(err){
      if(err) return done(err);
      fixtures = {};
      done();
    });
  });

  /* Validations */
  describe('validations', function(){

    describe('required fields', function(){
      var ticket = new Ticket();

      it("should enforce required fields", function(done){
        ticket.save(function(err){
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

      it('should strip out user access token', function(){
        var obj = fixtures.tickets[0].toClient();
        should.not.exist(obj.user.access_token);
      });

      it('should strip out embedded comments', function(){
        var obj = fixtures.tickets[0].toClient();
        should.not.exist(obj.comments);
      });

      it('should rename _id property to id', function(){
        var obj = fixtures.tickets[0].toClient();
        should.not.exist(obj._id);
        should.exist(obj.id);
      });
    });


    /* Update */
    /* Should test the update method follows the correct rules */
    describe('update', function(){
      var testObject = {}, origTitle;

      before(function(done){
        var data = {};
        origTitle = fixtures.tickets[0].title
        data.title = "title UPDATED";
        data.description = "description UPDATED";
        data.status = "closed";
        data.assigned_to = [fixtures.users[0].id, fixtures.users[0].id];

        fixtures.tickets[0].update(data, function(err, model){
          if(err) return done(err);
          testObject = model;
          done();
        });
      });

      after(function(done){
        fixtures.tickets[0].update({title: origTitle}, function(err, model){
          if(err) return done(err);
          done();
        });
      })

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

      it('should assign user to ticket', function(){
        var assignedTo = testObject.assigned_to[0].toString();
        assignedTo.should.equal(fixtures.users[0].id);
      });

      it('should strip out duplicate ids', function(){
        testObject.assigned_to.length.should.equal(1);
      });
    });


    /* Remove Ticket */
    /* Should test a ticket can be successfully removed */
    describe('removeTicket', function(){
      var result;

      // Run removeTicket and return result
      before(function(done){
        // Insert a Test Ticket and destory it
        var ticket = new Ticket({
          title: "destroy example",
          description: "a ticket to use for static methods",
          user: fixtures.users[0]._id
        });
        ticket.save(function(err, model){
          if(err) return done(err);
          model.removeTicket(function(err, status){
            if(err) return done(err);
            result = status;
            done();
          });
        });
      });

      it('should destroy a ticket', function(done){
        Ticket.findOne({title: "destroy example"}).run(function(err, ticket){
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
     * GetAll
     * -------------------- */

    /* Get All Open Tickets */
    /* Should return an array of tickets */
    describe('getAll Open', function(){
      var models;

      // Run get all and assign to users
      before(function(done){
        Ticket.getAll('open', 1, function(err, results){
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
    describe('getAll Closed', function(){
      var models;

      // Run get all and assign to users
      before(function(done){
        Ticket.getAll('closed', 1, function(err, results){
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
        models[0].title.should.equal('test ticket 1');
        models[1].title.should.equal('test ticket 3');
      });

      it('should run toClient() on ticket instances', function(){
        should.not.exist(models[0]._id);
        should.exist(models[0].id);
      });
    });


    /* getSingle */
    /* Should test a single ticket is returned */
    describe('getSingle', function(){
      var ticket;

      // Run getSingle and assign result to user
      before(function(done){
        Ticket.getSingle(fixtures.tickets[3]._id, function(err, model){
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
    describe('create', function(){
      var data, result;

      before(function(done){
        var obj = {
          title: "create ticket",
          description: "create description",
          user: fixtures.users[0]._id
        }
        data = obj;

        Ticket.create(data, function(err, ticket){
          result = ticket;
          done();
        });
      });


      it('should successfully create a ticket', function(done){
        // Perform a query to ensure ticket is inserted
        Ticket.findOne({"title":"create ticket"})
        .run(function(err, model){
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
        Ticket.create(data, function(err, ticket){
          err.should.equal('Error saving ticket');
          done();
        });
      });
    });

  }); // close static methods

});
