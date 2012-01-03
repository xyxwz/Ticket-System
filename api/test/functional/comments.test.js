var should = require("should"),
    helper = require('../support/helper'),
    url = require('url'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app();

/* Comments Controller Unit Tests */

describe('comments', function(){

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
  describe('GET /api/ticket/:ticketID/comments', function(){
    var res;

    before(function(done){
      request
      .get('http://127.0.0.1:3000/api/tickets/'+fixtures.tickets[0].id+"/comments")
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

    it('should return an array of comments', function(){
      res.body.should.be.an.instanceof(Array);
    });

    it('should contain 1 comment object', function(){
      var comments = res.body;
      comments.length.should.equal(1);
      should.exist(comments[0].id);
      should.exist(comments[0].comment)
      should.not.exist(comments[0].user.access_token);
    });
  });


  // Create
  describe('POST /api/tickets/:ticketID/comments', function(){
    var res;

    before(function(done){
      var commentObj = {
        "comment":"An example comment"
      }

      request
      .post('http://127.0.0.1:3000/api/tickets/'+fixtures.tickets[0].id+"/comments")
      .data(commentObj)
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

    it('should return comment object', function(){
      var comment = res.body;
      should.exist(comment.id);
      should.exist(comment.comment);
      should.exist(comment.created_at);
    });

    it('should return an embedded user object', function(){
      var comment = res.body;
      should.exist(comment.user.id);
      should.not.exist(comment.user.access_token); 
    });
  });


  // Show
  describe('GET /api/tickets/:ticketID/comments/:id', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id+"/comments/"+fixtures.comments[0].id;
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

    it('should return comment object', function(){
      var comment = res.body;
      should.exist(comment.id);
      should.exist(comment.comment);
      should.exist(comment.created_at);
    });

    it('should return an embedded user object', function(){
      var comment = res.body;
      should.exist(comment.user.id);
      should.not.exist(comment.user.access_token); 
    });
  });


  // Update
  describe('PUT /api/tickets/:ticketID/comments/:id', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id+"/comments/"+fixtures.comments[0].id;
      request
      .put(url)
      .data({"comment":"UPDATED"})
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

    it('should update ticker title', function(){
      res.body.comment.should.equal('UPDATED');
    });
    
    it('should return ticket object', function(){
     var comment = res.body;
      should.exist(comment.id);
      should.exist(comment.comment);
      should.exist(comment.created_at);
    });

    it('should return an embedded user object', function(){
      var comment = res.body;
      should.exist(comment.user.id);
      should.not.exist(comment.user.access_token); 
    });
  });


  // Delete
  describe('DELETE /api/tickets/:ticketID/comments/:id', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id+"/comments/"+fixtures.comments[0].id;
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
