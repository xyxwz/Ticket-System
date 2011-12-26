var app = require('../../../app.js'),
    mongoose = require("mongoose"),
    should = require("should"),
    helper = require('../../support/helper'),
    Comment = require('../../../models/comment').Comment,
    Ticket = require('../../../models/ticket').Ticket;

/* Comment Model Unit Tests */

describe('comment', function(){

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
      var comment = new Comment();

      it("should enforce required fields", function(done){
        comment.save(function(err){
          // Comment
          should.exist(err.errors.comment);
          err.errors.comment.type.should.equal("required");
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
      var comment;

      before(function(done){
        Ticket.findOne({_id:fixtures.tickets[0]})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);
          comment = model.comments.id(fixtures.comments[0]._id);
          done();
        });  
      });

      it('should strip out user access token', function(){
        var obj = comment.toClient();
        should.not.exist(obj.user.access_token);
      });

      it('should rename _id property to id', function(){
        var obj = comment.toClient();
        should.not.exist(obj._id);
        should.exist(obj.id);
        should.not.exist(obj.user._id);
        should.exist(obj.user.id);
      });
    });


    /* Update */
    /* Should test the update method follows the correct rules */
    describe('update', function(){
      var testObject = {};
      var data = {comment:"comment UPDATED"};

      before(function(done){
        fixtures.comments[0].update(fixtures.tickets[0], data, function(err, model){
          if(err) return done(err);
          testObject = model;
          done();
        });
      });

      it('should update comment', function(){
        testObject.comment.should.equal("comment UPDATED");
      });
    });


    /* Remove Comment */
    /* Should test a comment can be successfully removed */
    describe('removeComment', function(){
      var result;

      // Run removeComment and return result
      before(function(done){
        fixtures.comments[0].removeComment(fixtures.tickets[0], function(err, status){
          if(err) return done(err);
          result = status;
          done();
        });
      });

      it('should destroy a comment', function(done){
        Ticket.findOne({_id:fixtures.tickets[0]._id}).run(function(err, ticket){
          if(err) return done(err);
          ticket.comments.length.should.equal(0);
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

    // Insert a Test Comment
    before(function(done){
      var comment = new Comment({
        comment: "test comment",
        user: fixtures.users[0]._id
      });
      fixtures.tickets[0].comments.push(comment);
      fixtures.tickets[0].save(function(err, model) {
        if (err) return done(err);
        Ticket.findOne({_id:fixtures.tickets[0]})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);
          fixtures.comments = model.comments;
          done();
        });  
      });
    });


    /* getAll */
    /* Should return an array of tickets */
    describe('getAll', function(){
      var models;

      // Run get all and assign to users
      before(function(done){
        Comment.getAll(fixtures.comments, function(err, results){
          if(err) return done(err);
          models = results;
          done();
        });
      });

      it('should return an array', function(){
        models.should.be.an.instanceof(Array);
        models.length.should.equal(1);
      });

      it('should run toClient() on comment instances', function(){
        should.not.exist(models[0]._id);
        should.exist(models[0].id);
      });
    });


    /* getSingle */
    /* Should test a single comment is returned */
    describe('getSingle', function(){
      var comment;

      // Run getSingle and assign result to user
      before(function(done){
        Ticket.findOne({_id:fixtures.tickets[0]})
        .populate('user')
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);
          Comment.getSingle(model, 
          fixtures.comments[0]._id, function(err, model){
            if(err) return done(err);
            comment = model;
            done();
          });
        });
      });

      it('should return a comment object', function(){
        comment.comment.should.equal('test comment');
        should.not.exist(comment.user._id);
        should.not.exist(comment.user.access_token);
        should.exist(comment.user.id);
      });
    });


    /* create */
    /* Should add a comment to a ticket */
    describe('create', function(){
      var data,user,ticket,result;

      before(function(done){
        var obj = {
          comment: "create comment",
          user: fixtures.users[0]._id
        }
        data = obj;
        user = fixtures.users[0];
        ticket = fixtures.tickets[0];
        // run create and set result
        Comment.create(ticket, user, data, function(err, comment){
          if(err) return done(err);
          result = comment
          done();
        });
      });


      it('should successfully create a comment', function(done){
        // Perform a query to ensure comment is added
        Ticket.findOne({_id:ticket._id})
        .run(function(err, model){
          model.comments.length.should.equal(2);
          done();
        });
      });

      it('should return a populated comment object', function(){
        should.exist(result.id);
        should.exist(result.user.id);
        should.not.exist(result._id);
        should.not.exist(result.user._id);
      });

      it('should err if validations fail', function(done){
        data.comment = null;
        Comment.create(ticket, user, data, function(err, ticket){
          err.should.equal('Error saving comment');
          done();
        });
      });
    });

  }); // close static methods

});
