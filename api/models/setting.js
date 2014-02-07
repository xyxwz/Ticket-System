/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Setting model
   *
   * An application setting for the user
   */

  return sequelize.define('Setting', {
    name: {
      type: Types.STRING,
      validate: {
        isAlpha: true,
        notNull: true,
        notEmpty: true
      }
    },

    status: {
      type: Types.BOOLEAN,
      validate: {
        notNull: true
      }
    }
  });
};