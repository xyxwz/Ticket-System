var should = require("should"),
    helper = require('../support/helper'),
    _ = require('underscore'),
    url = require('url'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app(),
    Ticket = server.models.Ticket;

/**
 * Notifications and unread api endpoint controller tests
 */

describe('notifications and unread tickets', function(){
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

  // Get all notifications for a user
  describe('GET /api/notifications', function(){
    var res;

    before(function(done){
      // Update a ticket to create 1 notification
      request
        .put('http://127.0.0.1:3000/api/tickets/' + fixtures.tickets[1].id)
        .send({
          description: "Totally rad ticket",
          assigned_to: [fixtures.users[1].id]
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('X-Auth-Token', fixtures.users[0].access_token)
        .end(function() {
          // fetch notifications
          request
            .get('http://127.0.0.1:3000/api/notifications')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('X-Auth-Token', fixtures.users[1].access_token)
            .end(function(data){
              res = data;
              done();
            });
        });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should return an array of ticket ids', function(){
      res.body.should.be.an.instanceof(Array);
    });

    it('should return one notification', function() {
      res.body.should.have.length(1);
    });
  });

  // Delete a notification for a user
  describe('DELETE /api/notifications', function(){
    var res;

    before(function(done){
      // Update a ticket to create 1 notification
      request
        .put('http://127.0.0.1:3000/api/tickets/' + fixtures.tickets[1].id)
        .send({
          description: "Totally rad ticket",
          assigned_to: [fixtures.users[1].id]
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('X-Auth-Token', fixtures.users[0].access_token)
        .end(function() {
          // delete the notification
          request
            .del('http://127.0.0.1:3000/api/notifications/' + fixtures.tickets[1].id)
            .send({})
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('X-Auth-Token', fixtures.users[1].access_token)
            .end(function(data) {
              res = data;
              done();
            });
        });
    });

    it('should return a 200 status code', function(){
      res.status.should.equal(200);
    });

    it('should delete the notification', function() {
      // fetch notifications
      request
        .get('http://127.0.0.1:3000/api/notifications')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('X-Auth-Token', fixtures.users[1].access_token)
        .end(function(reply){
          reply.body.should.have.length(0);
        });
    });
  });

  // Get all unread tickets (assigned_to.length === 0)
  describe('GET /api/unread', function(){
    var res;

    before(function(done){
      request
        .get("http://127.0.0.1:3000/api/unread/")
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

    it('should return an array of ticket ids', function(){
      res.body.should.be.instanceof(Array);
    });

    it('should return one unread ticket', function(){
      res.body.should.have.length(2);
    });
  });

});
