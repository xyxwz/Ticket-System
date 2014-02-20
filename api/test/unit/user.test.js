/**
 * Test dependencies
 */

var User = require('../').User;

/**
 * Tests for User model
 */

describe('User', function() {
  describe('Ticket association', function() {
    var user, ticket;

    before(function(done) {
      user = User.build({
        name: 'The Dude',
        username: 'dude',
        avatar: 'http://goo.gl/mksz6H'
      });

      user.save().complete(done);
    });

    it('should be able to be assigned', function(done) {
      user.owning.add()
      done();
    });

    it('should be able to watch', function(done) {
      console.log("TEST");
      done();
    });
  });
});