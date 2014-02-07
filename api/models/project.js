/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Project model
   *
   * A global grouping of ticket objects
   */

  return sequelize.define('Project', {
    name: {
      type: Types.STRING,
      validate: {
        isAlpha: true
      }
    }
  });
};