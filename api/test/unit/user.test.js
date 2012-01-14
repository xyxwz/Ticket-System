var should = require("should"),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app,
    mongoose = require("mongoose");

var server = app(),
    User = require('../../models/User')(server);

/* User Model Unit Tests */

describe('user', function(){

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

      it("should enforce required fields", function(done){
        User.create({}, function(err){
          // Email
          should.exist(err.errors.email);
          err.errors.email.type.should.equal("required");
          // Role
          should.exist(err.errors.role);
          err.errors.role.type.should.equal("required");
          // Name
          should.exist(err.errors.name);
          err.errors.name.type.should.equal("required");
          done();
        });
      });
    });

  });


  /* ------------------------------- *
   * Instance Methods
   * ------------------------------- */
  describe('instance methods', function(){  

    /* To Client */
    /* Should test the object is ready to be sent to the client */
    describe('toClient', function(){

      it('should strip out access token', function(){
        var obj = fixtures.users[0].toClient();
        should.not.exist(obj.access_token);
      });

      it('should rename _id property to id', function(){
        var obj = fixtures.users[0].toClient();
        should.not.exist(obj._id);
        should.exist(obj.id);
      });
    });


    /* Update */
    /* Should test the update method follows the correct rules */
    describe('update', function(){
      var klass, testObject, data;

      before(function(done){
        data = {
          email: "updated@test.com",
          name: "John Doe UPDATED",
          role: "member",
          access_token: null,
        }

        klass = new User(fixtures.users[0]);

        klass.update(data, function(err, model){
          if(err) return done(err);
          testObject = model;
          done();
        });
      });

      it('should update required fields', function(){
        testObject.name.should.equal("John Doe UPDATED");
        testObject.role.should.equal("member");
      });

      it('should not update access token', function(){
        fixtures.users[0].access_token.should.not.equal(null);
      });
    });


    /* Remove */
    /* Should test a user can be successfully removed */
    describe('remove', function(){
      var klass, result;

      // Run removeUser and return result
      before(function(done){
        klass = new User(fixtures.users[0]);

        klass.remove(function(err, status){
          if(err) return done(err);
          result = status;
          done();
        });
      });

      it('should destroy a user account', function(done){
        User.all(function(err, users) {
          users.length.should.equal(1);
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
    var data;

     // Insert a Test User
    before(function(done){
      data = {
        email: "static.example@example.com",
        name: "John Doe",
        role: "admin",
        access_token: "abc"
      }

      User.create(data, function(err, model) {
        if(err) return done(err);
        fixtures.users.push(model);
        done();
      });
    });


    /* all */
    /* Should return an array of users */
    describe('all', function(){
      var users;

      // Run all and assign to users
      before(function(done){
        User.all(function(err, results) {
          if(err) return done(err);
          users = results;
          done();
        });
      });

      it('should return an array', function(){
        users.should.be.an.instanceof(Array);
        users.length.should.equal(2);
      });

      it('should run toClient() on user instances', function(){
        should.not.exist(users[0]._id);
        should.exist(users[0].id);
      });
    });


    /* find */
    /* Should test a single user is returned */
    describe('find', function(){
      var user;

      // Run find and assign result to user
      before(function(done){
        User.find(fixtures.users[1].id, function(err, model){
          if(err) return done(err);
          user = model;
          done();
        });
      });

      it('should return a user object', function(){
        should.not.exist(user._id);
        should.not.exist(user.access_token);
        should.exist(user.id);
        should.exist(user.name);
      });
    });


    /* create */
    /* Should add a user to the database */
    describe('create', function(){
      var data = {
        email: "create.example@example.com",
        name: "John Doe",
        role: "member"
      }

      it('should successfully create a user', function(done){
        User.create(data, function(err, user){
          // Perform a query to ensure user is inserted
          User.find(user.id, function(err, model){
            model.name.should.equal(user.name);
            done();
          });
        });
      });

      it('should err if validations fail', function(done){
        User.create(data, function(err, user){
          should.exist(err);
          done();
        });
      });
    });


    /* Set User Access Token *
    /* Should assign an access token to a user */
    describe('setAccessToken', function(){

      it('should add an access token', function(done){
        User.setAccessToken(
        'create.example@example.com', '123', 
        function(err, user){
          should.exist(user.access_token);
          user.access_token.should.equal('123');
          done();
        });
      });

      it('should return a token', function(done){
        User.setAccessToken(
        'create.example@example.com', '123', 
        function(err, user){
          user.access_token.should.equal('123');
          done();
        });
      });

      it('should return error for non-authorized user', function(done){
        User.setAccessToken(
        'non-valid@example.com', '123', 
        function(err){
          err.should.equal('Not an authorized user');
          done();
        });
      });

    });

   }); // close static methods

});
