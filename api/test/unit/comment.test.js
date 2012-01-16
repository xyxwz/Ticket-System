var should = require("should"),
    _ = require('underscore'),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app,
    schemas = require('../../models/schemas'),
    mongoose = require("mongoose");

var server = app(),
    Comment = require('../../models/Comment')(server);

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
      var ticket, user;

      before(function() {
        ticket = fixtures.tickets[0];
        user = fixtures.users[0]
      });

      it("should enforce required fields", function(done){
        Comment.create(ticket, user, {}, function(err){
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
      var ticket, comment, obj;

      before(function(done){
        schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);

          ticket = model;
          comment = model.comments.id(fixtures.comments[0].id);
          obj = new Comment(comment, ticket)._toClient();
          done();
        });
      });

      it('should strip out user access token', function(){
        should.not.exist(obj.user.access_token);
      });

      it('should rename _id property to id', function(){
        should.not.exist(obj._id);
        should.exist(obj.id);
        should.not.exist(obj.user._id);
        should.exist(obj.user.id);
      });
    });


    /* Update */
    /* Should test the update method follows the correct rules */
    describe('update', function(){
      var klass, ticket, comment, data, obj;

      before(function(done){
        schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);

          ticket = model;
          comment = model.comments.id(fixtures.comments[0].id);
          klass = new Comment(comment, ticket);
          data = {comment:"comment UPDATED"};

          klass.update(data, function(err, model){
            if(err) return done(err);
            obj = model;
            done();
          });
        });
      });

      it('should update comment', function(){
        obj.comment.should.equal("comment UPDATED");
      });

      it('should set modified_at time', function(){
        should.exist(obj.modified_at);
        obj.modified_at.should.not.equal(obj.created_at);
      });
    });


    /* Remove Comment */
    /* Should test a comment can be successfully removed */
    describe('removeComment', function(){
      var klass, ticket, comment, result;

      before(function(done){
        schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);

          ticket = model;
          comment = model.comments.id(fixtures.comments[0].id);
          klass = new Comment(comment, ticket);

          klass.remove(function(err, res){
            if(err) return done(err);

            result = res;
            done();
          });
        });
      });

      it('should destroy a comment', function(done){
        schemas.Ticket.findOne({_id:fixtures.tickets[0].id}).run(function(err, ticket){
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
    var comments = new Array();


    // Insert a Test Comment
    before(function(done){
      var data, ticket, comment;

      comment = new schemas.Comment({
        comment: "test comment",
        user: fixtures.users[0].id
      });

      schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
      .populate('comments.user')
      .run(function(err, model){
        if(err) return done(err);

        ticket = model;
        ticket.comments.push(comment);

        ticket.save(function(err, model){
          comments = model.comments;
          done();
        });
      });
    });


    /* all */
    /* Should return an array of comments */
    describe('all', function(){
      var models;

      // Run get all and assign to models
      before(function(done){
        Comment.all(comments, function(err, results){
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


    /* find */
    /* Should test a single comment is returned */
    describe('find', function(){
      var comment;

      // Run find and assign result to comment
      before(function(done){
        schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
        .populate('user')
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);
          Comment.find(model.comments, comments[0].id, function(err, model){
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
      var data, user, ticket, result;

      before(function(done){
        data = {
          comment: "create comment",
          user: fixtures.users[0]._id
        }

        user = fixtures.users[0];

        schemas.Ticket.findOne({_id:fixtures.tickets[0].id})
        .populate('comments.user')
        .run(function(err, model){
          if(err) return done(err);

          ticket = model;
          Comment.create(ticket, user, data, function(err, res) {
            if(err) return done(err);

            result = res;
            done();
          });
        });
      });


      it('should successfully create a comment', function(done){
        // Perform a query to ensure comment is added
        schemas.Ticket.findOne({_id:ticket.id})
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

      it('should set created_at date', function(){
        should.exist(result.created_at);
        should.not.exist(result.modified_at);
      });

      it('should err if validations fail', function(done){
        data.comment = null;
        Comment.create(ticket, user, data, function(err, ticket){
          should.exist(err.errors.comment);
          done();
        });
      });
    });

  }); // close static methods

});
