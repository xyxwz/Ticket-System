/**
 * Module dependencies
 */

var models = require('../../models');

/**
 * Counter for unique fields
 */

var counter = function() {
  var i = 0;

  return function() {
    return i = i + 1;
  };
};


/**
 * Expose fixtures
 */

module.exports = {

  /**
   * User fixture, create a user
   *
   * @param {Object} obj optional overrides
   * @param {Function} done
   */

  user: function(obj, done) {
    var count = counter();

    done = done || obj;
    obj = typeof obj !== 'function' ? {} : obj;

    function build(done) {
      var i = count();

      return models.User.build({
        name: obj.name || 'Test User ' + i,
        username: obj.username || 'testuser' + i,
        role: obj.role || 'member',
        avatar: 'http://goo.gl/mksz6H'
      });
    }

    return build(done);
  },

  /**
   * Ticket fixture, create a ticket
   *
   * @param {Object} obj optional overrides
   * @param {Function} done
   */

  ticket: function(obj, done) {
    var count = counter();

    done = done || obj;
    obj = typeof obj !== 'function' ? {} : obj;

    function build(done) {
      var i = count();

      return models.Ticket.build({
        title: obj.title || 'Test Ticket ' + i,
        description: obj.description || 'Test ticket description',
        closed_at: obj.closed_at || null
      });
    }

    return build(done);
  },

  /**
   * Tag fixture, create a tag
   *
   * @param {Object} obj optional overrides
   * @param {Function} done
   */

  tag: function(obj, done) {
    var count = counter();

    done = done || obj;
    obj = typeof obj !== 'function' ? {} : obj;

    function build(done) {
      var i = count();

      return models.Tag.build({
        name: obj.name || 'Test Tag ' + i,
        color: obj.color || '#fff'
      });
    }

    return build(done);
  },

  /**
   * Comment fixture, create a comment
   *
   * @param {Object} obj optional overrides
   * @param {Function} done
   */

  comment: function(obj, done) {
    var count = counter();

    done = done || obj;
    obj = typeof obj !== 'function' ? {} : obj;

    function build(done) {
      var i = count();

      return models.Comment.build({
        text: obj.text || 'Comment text ' + i
      });
    }

    return build(done);
  },

  /**
   * Notification fixture, create a notification
   *
   * @param {Object} obj optional overrides
   * @param {Function} done
   */

  notification: function(obj, done) {
    done = done || obj;
    obj = typeof obj !== 'function' ? {} : obj;

    return models.Notification.build({
      read: obj.read || false
    });
  }
};