var should = require("should"),
    helper = require('../support/helper'),
    _ = require('underscore'),
    app = require('../support/bootstrap').app,
    request = require('superagent');

var server = app(),
    Project = server.models.Project;

/**
 * Projects controller functional tests
 */

describe('projects controller', function() {
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
   * Get all projects
   * GET /api/projects
   */
  describe('GET /api/projects', function() {
    var res;

    before(function(done) {
      request.get('http://127.0.0.1:3000/api/projects')
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

    it('should return an array of projects', function() {
      res.body.should.be.an.instanceof(Array);
    });

    it('should return 2 projects', function() {
      res.body.should.be.length(2);

      res.body.forEach(function(project) {
        project.should.have.keys('user', 'id',
          'description', 'created', 'tickets', 'name');
      });
    });

  });


  /**
   * Get a single project
   * GET /api/projects/:projectID
   */
  describe('GET /api/projects/:projectID', function() {
    var res;

    before(function(done) {
      request.get('http://127.0.0.1:3000/api/projects/' + fixtures.projects[0].id)
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

    it('should return the correct project', function() {
      var project = res.body,
          fixture = fixtures.projects[0];

      project.should.have.property('id', fixture._id.toString());
      project.should.have.property('user', fixture.user.toString());
      project.should.have.property('name', fixture.name);
      project.should.have.property('description', fixture.description);
      project.should.have.property('created', fixture.created.toJSON());
      project.should.have.property('tickets');
      project.tickets.should.be.length(0);
    });

  });


  /**
   * Create a project
   * POST /api/projects
   */
  describe('POST /api/projects', function() {
    var res, attrs;

    before(function(done) {
      attrs = {
        'name': 'New project',
        'description': 'API created project',
        'user': fixtures.users[0].id
      };

      request.post('http://127.0.0.1:3000/api/projects')
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

    it('should return valid project', function() {
      res.body.should.have.keys('user', 'id', 'description',
        'name', 'created', 'tickets');
    });

    it('should have the same attributes', function() {
      var project = res.body;
      project.should.have.property('user', attrs.user);
      project.should.have.property('name', attrs.name);
      project.should.have.property('description', attrs.description);
    });

  });


  /**
   * Update a project
   * PUT /api/projects/:projectID
   */
  describe('PUT /api/projects/:projectID', function() {
    var res, attrs;

    before(function(done) {
      attrs = {
        name: 'Updated test project',
        description: 'Updated with the api'
      };

      request.put('http://127.0.0.1:3000/api/projects/' + fixtures.projects[0].id)
      .send(attrs)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[0].access_token)
      .end(function(reply){
        res = reply;
        return done();
      });
    });

    it('should return a project object', function() {
      res.body.should.have.keys('name', 'id', 'description', 'user', 'tickets', 'created');
    });

    it('should return a 200 status code', function() {
      res.status.should.equal(200);
    });

    it('should update project name', function() {
      res.body.name.should.equal(attrs.name);
    });

    it('should update project description', function() {
      res.body.description.should.equal(attrs.description);
    });

  });

  /**
   * Delete a project
   * DELETE /api/projects/:projectID
   */
  describe('DELETE /api/projects/:projectID', function() {
    var res;

    before(function(done) {
      request.del('http://127.0.0.1:3000/api/projects/' + fixtures.projects[0].id)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Token', fixtures.users[1].access_token)
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