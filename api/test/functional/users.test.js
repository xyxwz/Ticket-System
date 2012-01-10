var should = require("should"),
    helper = require('../support/helper'),
    url = require('url'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app();

/* Users Controller Unit Tests */

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

  /* Routes */

  // Index
  describe('GET /api/users', function(){
    var res;

    before(function(done){
      request
      .get('http://127.0.0.1:3000/api/users')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(err, data){
        res = data;
        done();
      });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should return an array of users', function(){
      res.body.should.be.an.instanceof(Array);
    });

    it('should contain 1 user object', function(){
      var users = res.body;
      users.length.should.equal(1);
      should.exist(users[0].id);
      should.not.exist(users[0].access_token);
    });
  });


  // Create
  describe('POST /api/users', function(){
    var res;

    before(function(done){
      var userObject = {
        "email":"post@example.com",
        "name":"Example User",
        "role":"admin"
      }

      request
      .post('http://127.0.0.1:3000/api/users')
      .data(userObject)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(err, data){
        res = data;
        done();
      });
    });

    it('should return a 201 status code', function(){
      res.status.should.equal(201);
    });

    it('should return user object', function(){
      var user = res.body;
      should.exist(user.id);
      should.exist(user.name);
    });
  });


  // Show
  describe('GET /api/users/:userID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/users/"+fixtures.users[0].id;
      request
      .get(url)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(err, data){
        res = data;
        done();
      });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should return a user object', function(){
      var user = res.body;
      should.exist(user.id);
      should.exist(user.name);
      should.not.exist(user.access_token);
    });
  });


  // Update
  describe('PUT /api/users/:userID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/users/"+fixtures.users[0].id;
      request
      .put(url)
      .data({"name":"UPDATED"})
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(err, data){
        res = data;
        done();
      });  
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should update user name', function(){
      res.body.name.should.equal('UPDATED');
    });
    
    it('should return a user object', function(){
      var user = res.body;
      should.exist(user.id);
      should.not.exist(user.access_token);
    });
  });


  // Delete
  describe('DELETE /api/users/:userID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/users/"+fixtures.users[0].id;
      request
      .del(url)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(err, data){
        res = data;
        done();
      });  
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });
    
    it('should return success', function(){
      should.exist(res.body.success);
    });
  });

});
