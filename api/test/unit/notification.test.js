var should = require('should'),
    _ = require('underscore'),
    helper = require('../support/helper'),
    app = require('../support/bootstrap').app;

var server = app(),
    Notifications = require('../../models/helpers/').Notifications;

/* Ticket Model Unit Tests */

describe('notification', function(){

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


  describe('participating', function() {
    var user, ticket;

    before(function(done) {
      user = fixtures.users[1];
      ticket = fixtures.tickets[0];
      done();
    });

    it('should not be participating in ticket', function(done) {
      Notifications.isParticipating(server.redis, user.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.false;
        done();
      });
    });

    it('should add', function(done) {
      Notifications.nowParticipating(server.redis, user.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        Notifications.isParticipating(server.redis, user.id, ticket.id, function(err, status) {
          should.not.exist(err);
          status.should.be.true;
          done();
        });
      });
    });

    it('should remove participation', function(done) {
      Notifications.nowParticipating(server.redis, user.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;

        Notifications.removeParticipating(server.redis, user.id, ticket.id, function(err, status) {
          should.not.exist(err);
          status.should.be.true;

          Notifications.isParticipating(server.redis, user.id, ticket.id, function(err, status) {
            should.not.exist(err);
            status.should.be.false;
            done();
          });
        });
      });
    });
  });

  describe('notifications', function() {
    var user, user2, ticket, ticket2;

    before(function(done) {
      user = fixtures.users[0];
      user2 = fixtures.users[1];
      ticket = fixtures.tickets[0];
      ticket2 = fixtures.tickets[1];

      Notifications.nowParticipating(server.redis, user2.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        Notifications.nowParticipating(server.redis, user2.id, ticket2.id, function(err, status) {
          should.not.exist(err);
          status.should.equal.true;
          done();
        });
      });
    });

    it('user should push successfully', function(done) {
      Notifications.pushNotification(server.redis, user.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        done();
      });
    });

    it('user should not get notifications', function(done) {
      Notifications.pushNotification(server.redis, user2.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        Notifications.hasNotification(server.redis, user.id, ticket.id, function(err, status) {
          should.not.exist(err);
          status.should.be.false;
          done();
        });
      });
    });

    it('user2 should have notifications on ticket', function(done) {
      Notifications.pushNotification(server.redis, user.id, ticket2.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        Notifications.hasNotification(server.redis, user2.id, ticket2.id, function(err, status) {
          should.not.exist(err);
          status.should.be.true;
          done();
        });
      });
    });

    it('should remove notifications', function(done) {
      Notifications.pushNotification(server.redis, user.id, ticket.id, function(err, status) {
        should.not.exist(err);
        status.should.be.true;
        Notifications.hasNotification(server.redis, user2.id, ticket.id, function(err, status) {
          should.not.exist(err);
          status.should.be.true;
          Notifications.removeNotification(server.redis, user2.id, ticket.id, function(err, status) {
            should.not.exist(err);
            status.should.be.true;
            Notifications.hasNotification(server.redis, user2.id, ticket.id, function(err, status) {
              should.not.exist(err);
              status.should.be.false;
              done();
            });
          });
        });
      });
    });

  });
});