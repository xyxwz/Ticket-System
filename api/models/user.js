/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * User model
   *
   * User datas from passport
   */

  return sequelize.define('User', {
    token: Types.STRING,

    active: {
      type: Types.BOOLEAN,
      validate: {
        notNull: true
      }
    },

    role: {
      type: Types.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    avatar: {
      type: Types.STRING,
      validate: {
        isURL: true
      }
    }
  });
};