var should = require("should"),
    helper = require('../../support/helper'),
    app = require('../../support/bootstrap').app,
    Route = require("../../../lib/middleware/access_control/lib/route"),
    Access = require("../../../lib/middleware/access_control/lib/access");

var server = app();

/* Access Control - Access Unit Test */

describe('Access', function(){
  // Hold values used in async hooks
  var fixtures, route, user, accessLevels, access;

  // Use a nested route to ensure nested paths work
  before(function(done) {
    helper.Setup(server, function(err, data) {
      fixtures = data;
      var path = "/tickets/:ticketID/comments/:commentID";
      var url = "/tickets/" + fixtures.tickets[0].id + "/comments/" + fixtures.comments[0].id;
      route = new Route(path);
      route.match(url);
      route.mapKeys();
      user = fixtures.users[0];
      return done(err);
    });
  });

  after(function(done) {
    helper.Teardown(server, function(err) {
      return done(err);
    });
  });


  describe('.checkAccess(user)', function(){

    describe('for user group roles', function() {

      describe('when member', function() {

        beforeEach(function(done){
          accessLevels = ["member"];
          access = new Access(route, accessLevels);
          access.resolveKeys(function(err){
            if(err) done(err);
            done();
          });
        });

        it('should allow a member access', function(){
          user.role = "member";
          var status = access.checkAccess(user);
          status.should.be.true;
        });

        it('should deny any other role access', function(){
          user.role = "foo";
          var status = access.checkAccess(user);
          status.should.be.false;
        });
      });

      describe('when admin', function() {

        beforeEach(function(done){
          accessLevels = ["admin"];
          access = new Access(route, accessLevels);
          access.resolveKeys(function(err){
            if(err) done(err);
            done();
          });
        });

        it('should allow an admin access', function(){
          user.role = "admin";
          var status = access.checkAccess(user);
          status.should.be.true;
        });

        it('should deny any other role access', function(){
          user.role = "member";
          var status = access.checkAccess(user);
          status.should.be.false;
        });
      });

      describe('when read', function() {

        beforeEach(function(done){
          accessLevels = ["read"];
          access = new Access(route, accessLevels);
          access.resolveKeys(function(err){
            if(err) done(err);
            done();
          });
        });

        it('should allow read access', function(){
          user.role = "read";
          var status = access.checkAccess(user);
          status.should.be.true;
        });

        it('should deny any other role access', function(){
          user.role = "member";
          var status = access.checkAccess(user);
          status.should.be.false;
        });
      });

      describe('when owner', function() {

        before(function(done){
          accessLevels = ["owner"];
          access = new Access(route, accessLevels);
          access.resolveKeys(function(err){
            if(err) done(err);
            done();
          });
        });

        it('should allow owner access', function(){
          var status = access.checkAccess(user);
          status.should.be.true;
        });

        it('should deny non-owners access', function(){
          var status = access.checkAccess(fixtures.users[1]);
          status.should.be.false;
        });
      });
    });
  });
});
