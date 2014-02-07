/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Comment model
   *
   * Comments on a ticket
   */

  return sequelize.define('Comment', {
    text: {
      type: Types.TEXT,
      validate: {
        notNull: true,
        notEmpty: true
      }
    }
  });
};