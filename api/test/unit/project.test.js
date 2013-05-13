var should = require('should'),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app;

var server = app(),
    Project = server.models.Project;


/**
 * Project Model unit tests
 *  - covers Project model and Schema
 */
describe('project', function(){

  // Hold values used in async hooks
  var fixtures;

  // Get our fixtures from the helper module
  before(function(done) {
    helper.Setup(server, function(err, data) {
      fixtures = data;
      return done(err);
    });
  });

  after(function(done) {
    helper.Teardown(server, function(err) {
      return done(err);
    });
  });


  /**
   * Schema
   */
  describe('schema', function() {

    describe('validations', function() {
      var error, model;

      before(function(done) {
        Project.create({}, function(err, data) {
          error = err;
          model = data;
          return done();
        });
      });

      // Error should be present and not the model itself
      it('should not create empty model', function() {
        should.exist(error);
        should.not.exist(model);
      });

      // Name and user and required for creation
      it('should enforce required fields', function() {
        should.exist(error.errors.name);
        error.errors.name.type.should.equal('required');
        should.exist(error.errors.user);
        error.errors.name.type.should.equal('required');
      });

      // Description and tickets are not required for project creation
      it('should not enforce non-required fields', function() {
        should.not.exist(error.errors.description);
        should.not.exist(error.errors.tickets);
      });
    });

    describe('on schema functions', function() {
      var project;

      before(function() {
        project = fixtures.projects[0];
      });

      // Should correctly convert project into an object that
      // can be serialized, with the proper values
      it('should correctly toClient()', function() {
        var obj = project.toClient();
        obj.should.have.property('id', project._id);
        obj.should.have.property('name', project.name);
        obj.should.have.property('description', project.description);
        obj.should.have.property('tickets', project.tickets);
        obj.should.have.property('created', project.created);
      });
    });

  });


  /**
   * Instance methods
   */
  describe('instance methods', function() {
    var project;

    before(function() {
      project = new Project(fixtures.projects[1]);
    });

    it('should successfully call remove callback on remove()', function(done) {
      project.remove(function(err, status) {
        should.not.exist(err);
        should.exist(status);
        status.should.equal('ok');
        return done();
      });
    });

    it('should remove model from collection on remove()', function() {
      Project.all(function(err, projects) {
        should.not.exist(err);
        should.exist(projects);
        projects.should.be.length(1);
      });
    });

  });


  /**
   * Static methods
   */
  describe('static methods', function() {

    describe('should create project', function(done) {
      var attrs, project, errors;

      before(function(done) {
        attrs = {
          name: 'Project creation',
          description: 'Creation test',
          user: fixtures.users[1].id
        };

        Project.create(attrs, function(err, model) {
          project = model;
          return done();
        });
      });

      it('with no errors', function() {
        should.not.exist(errors);
        should.exist(project);
        project.should.have.keys('id', 'name', 'description', 'tickets', 'user', 'created');
      });

      it('with correct name', function() {
        project.name.should.equal(attrs.name);
      });

      it('with correct description', function() {
        project.description.should.equal(attrs.description);
      });

      it('with correct userid', function() {
        project.user.toString().should.equal(attrs.user);
      });
    });

    describe('should find my projects with .mine()', function(done) {
      var projects, error;

      before(function(done) {
        Project.create({
          name: 'Find my projects test',
          user: fixtures.users[0].id,
          description: 'Test project'
        }, function(err, model) {
          if(err) return done(err);

          Project.create({
            name: 'Find my projects test',
            user: fixtures.users[0].id,
            description: 'Test project 2'
          }, function(err, model) {
            if(err) return done(err);

            Project.mine(fixtures.users[0].id, function(err, models) {
              error = err;
              projects = models;
              return done();
            });
          });
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct length', function() {
        projects.should.be.length(2);
      });

      it('and be accurate', function() {
        var i, len, userStr;

        for(i = 0, len = projects.length; i < len; i++) {
          userStr = projects[i].user.toString();
          userStr.should.equal(fixtures.users[0].id);
        }
      });
    });

    describe('should retrieve all projects', function() {
      var projects, error;

      before(function(done) {
        Project.all(function(err, models) {
          error = err;
          projects = models;
          return done();
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct length', function() {
        projects.should.be.length(4);
      });

      it('and be valid projects', function() {
        var i, len;

        for(i = 0, len = projects.length; i < len; i++) {
          projects[i].should.have.keys('user', 'description',
            'name', 'id', 'tickets', 'created');
        }
      });
    });

    describe('should retrieve project on find', function() {
      var project, error;

      before(function(done) {
        Project.find(fixtures.projects[0].id, function(err, model) {
          error = err;
          project = model;
          return done();
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct id', function() {
        project.id.toString().should.equal(fixtures.projects[0].id);
      });

      it('and be a valid project', function() {
        project.should.have.keys('user', 'description',
          'name', 'id', 'tickets', 'created');
      });
    });

  });


  /**
   * Model events
   */
  describe('model events', function() {
    var project;

    before(function() {
      project = new Project(fixtures.projects[0]);
    });

    it('should fire on update', function(done) {
      var attrs = fixtures.projects[0].toClient();
      attrs.name = 'Event test';

      server.eventEmitter.once('project:update', function that(model) {
        should.exist(model);
        model.should.eql(attrs);
        return done();
      });

      project.update(attrs, function(err, model) {
        should.not.exist(err);
        should.exist(model);
      });
    });

    it('should fire on create', function(done) {
      var attrs = {
        name: 'Create event test',
        description: 'Project for event tests',
        user: fixtures.users[1].id
      };

      server.eventEmitter.once('project:new', function(model) {
        should.exist(model);
        model.should.have.keys('id', 'name', 'tickets', 'user', 'created', 'description');
        return done();
      });

      Project.create(attrs, function(err, model) {
        should.not.exist(err);
        should.exist(model);
      });
    });

    it('should fire on remove', function(done) {
      var id = fixtures.projects[0].toClient().id;

      server.eventEmitter.once('project:remove', function(model) {
        should.exist(model);
        model.should.have.property('id', id);
        return done();
      });

      project.remove(function(err, status) {
        should.not.exist(err);
        should.exist(status);
      });
    });

  });

});