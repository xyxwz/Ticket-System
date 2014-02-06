var should = require("should"),
    helper = require('../support/helper'),
    _ = require('underscore'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app(),
    List = server.models.List;

/**
 * Lists controller functional tests
 */

describe('lists controller', function() {
  var fixtures;

  before(function(done) {
    helper.Setup(server, function(err, data) {
      if(err) return done(err);
      fixtures = data;
      return done();
    });
  });

  after(function(done) {
    helper.Teardown(server, function(err) {
      if(err) return done(err);
      return done();
    });
  });


  /**
   * Get all lists
   * GET /api/lists
   */
  describe('GET /api/lists', function() {
    var res;

    before(function(done) {
      request.get('http://127.0.0.1:3000/api/lists')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply) {
        res = reply;
        return done();
      });
    });

    it('should return a 200 status code', function() {
      res.status.should.equal(200);
    });

    it('should return an array of lists', function() {
      res.body.should.be.an.instanceof(Array);
    });

    it('should return my lists', function() {
      res.body.forEach(function(list) {
        list.should.have.keys('user', 'id', 'created', 'color', 'tickets', 'name');
        list.user.should.equal(fixtures.users[0].id);
      });
    });

  });


  /**
   * Get a single list
   * GET /api/lists/:listID
   */
  describe('GET /api/lists/:listID', function() {
    var res;

    before(function(done) {
      request.get('http://127.0.0.1:3000/api/lists/' + fixtures.lists[0].id)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply) {
        res = reply;
        return done();
      });
    });

    it('should return a 200 status code', function() {
      res.status.should.equal(200);
    });

    it('should return the correct list', function() {
      var list = res.body,
          fixture = fixtures.lists[0];

      list.should.have.property('id', fixture._id.toString());
      list.should.have.property('user', fixture.user.toString());
      list.should.have.property('name', fixture.name);
      list.should.have.property('created', fixture.created.toJSON());
      list.should.have.property('tickets');
      list.tickets.should.be.length(0);
    });

  });


  /**
   * Create a list
   * POST /api/lists
   */
  describe('POST /api/lists', function() {
    var res, attrs;

    before(function(done) {
      attrs = {
        'name': 'New list',
        'user': fixtures.users[0].id,
        'color': 0
      };

      request.post('http://127.0.0.1:3000/api/lists')
      .send(attrs)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply){
        res = reply;
        return done();
      });
    });

    it('should return a 201 status', function() {
      res.status.should.equal(201);
    });

    it('should return valid list', function() {
      res.body.should.have.keys('user', 'id', 'name', 'color', 'created', 'tickets');
    });

    it('should have the same attributes', function() {
      var list = res.body;
      list.should.have.property('user', attrs.user);
      list.should.have.property('name', attrs.name);
    });

  });


  /**
   * Update a list
   * PUT /api/lists/:listID
   */
  describe('PUT /api/lists/:listID', function() {
    var res, attrs;

    before(function(done) {
      attrs = {
        name: 'Updated test list',
        tickets: [ fixtures.tickets[0].id ],
        color: 0
      };

      request.put('http://127.0.0.1:3000/api/lists/' + fixtures.lists[0].id)
      .send(attrs)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply){
        res = reply;
        return done();
      });
    });

    it('should return a list object', function() {
      res.body.should.have.keys('name', 'id', 'user', 'color', 'tickets', 'created');
    });

    it('should return a 200 status code', function() {
      res.status.should.equal(200);
    });

    it('should update list name', function() {
      res.body.name.should.equal(attrs.name);
    });

    it('should update list tickets', function() {
      res.body.tickets.should.include(attrs.tickets[0]);
    });

  });

  /**
   * Delete a list
   * DELETE /api/lists/:listID
   */
  describe('DELETE /api/lists/:listID', function() {
    var res;

    before(function(done) {
      request.del('http://127.0.0.1:3000/api/lists/' + fixtures.lists[0].id)
      .send({})
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply){
        res = reply;
        return done();
      });
    });

    it('should return a 200 status code', function() {
      res.status.should.equal(200);
    });

    it('should return success', function() {
      res.body.should.have.property('success', 'ok');
    });

  });

});