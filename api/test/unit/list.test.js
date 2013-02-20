var should = require('should'),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app;

var server = app(),
    List = server.models.List;


/**
 * List Model unit tests
 *  - covers List model and Schema
 */
describe('list', function(){

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
        List.create({}, function(err, data) {
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

      // Description and tickets are not required for list creation
      it('should not enforce non-required fields', function() {
        should.not.exist(error.errors.tickets);
      });
    });

    describe('on schema functions', function() {
      var list;

      before(function() {
        list = fixtures.lists[0];
      });

      // Should correctly convert list into an object that
      // can be serialized, with the proper values
      it('should correctly toClient()', function() {
        var obj = list.toClient();
        obj.should.have.property('id', list._id);
        obj.should.have.property('name', list.name);
        obj.should.have.property('tickets', list.tickets);
        obj.should.have.property('created', list.created);
      });
    });

  });


  /**
   * Instance methods
   */
  describe('instance methods', function() {
    var list;

    before(function() {
      list = new List(fixtures.lists[1]);
    });

    it('should successfully call remove callback on remove()', function(done) {
      list.remove(function(err, status) {
        should.not.exist(err);
        should.exist(status);
        status.should.equal('ok');
        return done();
      });
    });

    it('should remove model from collection on remove()', function() {
      List.all(function(err, lists) {
        should.not.exist(err);
        should.exist(lists);
        lists.should.be.length(1);
      });
    });

  });


  /**
   * Static methods
   */
  describe('static methods', function() {

    describe('should create list', function(done) {
      var attrs, list, errors;

      before(function(done) {
        attrs = {
          name: 'List creation',
          user: fixtures.users[0].id,
          color: 0
        };

        List.create(attrs, function(err, model) {
          errors = err;
          list = model;
          return done();
        });
      });

      it('with no errors', function() {
        should.not.exist(errors);
        should.exist(list);
        list.should.have.keys('id', 'name', 'color', 'tickets', 'user', 'created');
      });

      it('with correct name', function() {
        list.name.should.equal(attrs.name);
      });

      it('with correct userid', function() {
        list.user.toString().should.equal(attrs.user);
      });
    });

    describe('should find my lists with .mine()', function(done) {
      var lists, error;

      before(function(done) {
        List.create({
          name: 'Find my lists test',
          user: fixtures.users[1].id,
          color: 0
        }, function(err, model) {
          if(err) return done(err);

          List.create({
            name: 'Find my lists test',
            user: fixtures.users[1].id,
            color: 0
          }, function(err, model) {
            if(err) return done(err);

            List.mine(fixtures.users[1].id, function(err, models) {
              error = err;
              lists = models;
              return done();
            });
          });
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct length', function() {
        lists.should.be.length(2);
      });

      it('and be accurate', function() {
        var i, len, userStr;

        for(i = 0, len = lists.length; i < len; i++) {
          userStr = lists[i].user.toString();
          userStr.should.equal(fixtures.users[1].id);
        }
      });
    });

    describe('should retrieve all lists', function() {
      var lists, error;

      before(function(done) {
        List.all(function(err, models) {
          error = err;
          lists = models;
          return done();
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct length', function() {
        lists.should.be.length(4);
      });

      it('and be valid lists', function() {
        var i, len;

        for(i = 0, len = lists.length; i < len; i++) {
          lists[i].should.have.keys('user', 'name', 'id', 'color', 'tickets', 'created');
        }
      });
    });

    describe('should retrieve list on find', function() {
      var list, error;

      before(function(done) {
        List.find(fixtures.lists[0].id, function(err, model) {
          error = err;
          list = model;
          return done();
        });
      });

      it('without errors', function() {
        should.not.exist(error);
      });

      it('and be the correct id', function() {
        list.id.toString().should.equal(fixtures.lists[0].id);
      });

      it('and be a valid list', function() {
        list.should.have.keys('user', 'name', 'id', 'color', 'tickets', 'created');
      });
    });

  });


  /**
   * Model events
   */
  describe('model events', function() {
    var list;

    before(function() {
      list = new List(fixtures.lists[0]);
    });

    it('should fire on update', function(done) {
      var attrs = fixtures.lists[0].toClient();
      attrs.name = 'Event test';

      server.eventEmitter.once('list:update', function that(model) {
        should.exist(model);
        model.should.eql(attrs);
        return done();
      });

      list.update(attrs, function(err, model) {
        should.not.exist(err);
        should.exist(model);
      });
    });

    it('should fire on create', function(done) {
      var attrs = {
        name: 'Create event test',
        user: fixtures.users[1].id,
        color: 0
      };

      server.eventEmitter.once('list:new', function(model) {
        should.exist(model);
        model.should.have.keys('id', 'name', 'tickets', 'color', 'user', 'created');
        return done();
      });

      List.create(attrs, function(err, model) {
        should.not.exist(err);
        should.exist(model);
      });
    });

    it('should fire on remove', function(done) {
      var id = fixtures.lists[0].toClient().id;

      server.eventEmitter.once('list:remove', function(model) {
        should.exist(model);
        model.should.have.property('id', id);
        return done();
      });

      list.remove(function(err, status) {
        should.not.exist(err);
        should.exist(status);
      });
    });

  });

});