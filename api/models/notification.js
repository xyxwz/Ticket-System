/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Notification model
   *
   * A notification on a ticket
   */

  return sequelize.define('Notification', {
    read: {
      type: Types.BOOLEAN,
      validate: {
        notNull: true
      }
    }
  });
};