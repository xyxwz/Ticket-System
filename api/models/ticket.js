/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Ticket model
   *
   * Request to get some arbitrary work done
   */

  return sequelize.define('Ticket', {
    closed_at: Types.DATETIME,

    title: {
      type: Types.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    description: {
      type: Types.TEXT,
      validate: {
        notNull: true,
        notEmpty: true
      }
    }
  });
};