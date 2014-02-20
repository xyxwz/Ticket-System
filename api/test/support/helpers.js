/**
 * Module dependencies
 */

var models = require('../../models');

/**
 * Export helpers
 */

module.exports = {

  /**
   * Create the database and all tables
   */

  before: function(done) {
    models.Sequelize.sync().complete(done);
  },

  /**
   * After handler for unit tests,
   *  destroy all remaining data
   */

  after: function(done) {
    models.Sequelize.drop().complete(done);
  }
};