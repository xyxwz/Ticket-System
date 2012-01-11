var should = require("should"),
    helper = require('../support/helper'),
    url = require('url'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app();

/* Tickets Controller Unit Tests */

describe('tickets', function(){

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
  describe('GET /api/tickets', function(){
    var res;

    before(function(done){
      request
      .get('http://127.0.0.1:3000/api/tickets')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(data){
        res = data;
        done();
      });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should return an array of tickets', function(){
      res.body.should.be.an.instanceof(Array);
    });

    it('should contain 2 ticket object', function(){
      var tickets = res.body;
      tickets.length.should.equal(2);
      should.exist(tickets[0].id);
      should.not.exist(tickets[0].user.access_token);
    });
  });


  // Create
  describe('POST /api/tickets', function(){
    var res;

    before(function(done){
      var ticketObj = {
        "title":"test ticket",
        "description":"An example test ticket"
      }

      request
      .post('http://127.0.0.1:3000/api/tickets')
      .send(ticketObj)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(data){
        res = data;
        done();
      });
    });

    it('should return a 201 status code', function(){
      res.status.should.equal(201);
    });

    it('should return ticket object', function(){
      var ticket = res.body;
      should.exist(ticket.id);
      should.exist(ticket.title);
      should.exist(ticket.description);
      should.exist(ticket.opened_at);
      ticket.status.should.equal('open');
    });

    it('should return an embedded user object', function(){
      var ticket = res.body;
      should.exist(ticket.user.id);
      should.not.exist(ticket.user.access_token); 
    });
  });


  // Show
  describe('GET /api/tickets/:ticketID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id;
      request
      .get(url)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(data){
        res = data;
        done();
      });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should return ticket object', function(){
      var ticket = res.body;
      should.exist(ticket.id);
      should.exist(ticket.title);
      should.exist(ticket.description);
    });

    it('should return an embedded user object', function(){
      var ticket = res.body;
      should.exist(ticket.user.id);
      should.not.exist(ticket.user.access_token); 
    });
  });


  // Update
  describe('PUT /api/tickets/:ticketID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id;
      request
      .put(url)
      .send({"title":"UPDATED"})
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(data){
        res = data;
        done();
      });  
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should update ticker title', function(){
      res.body.title.should.equal('UPDATED');
    });
    
    it('should return ticket object', function(){
      var ticket = res.body;
      should.exist(ticket.id);
      should.exist(ticket.title);
      should.exist(ticket.description);
    });

    it('should return an embedded user object', function(){
      var ticket = res.body;
      should.exist(ticket.user.id);
      should.not.exist(ticket.user.access_token); 
    });
  });


  // Delete
  describe('DELETE /api/tickets/:ticketID', function(){
    var res;

    before(function(done){
      url = "http://127.0.0.1:3000/api/tickets/"+fixtures.tickets[0].id;
      request
      .del(url)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(data){
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
