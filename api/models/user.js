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

    name: {
      type: Types.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    username: {
      type: Types.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    role: {
      type: Types.STRING,
      defaultValue: 'member',
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    avatar: {
      type: Types.STRING,
      validate: {
        isUrl: true
      }
    },

    active: {
      type: Types.BOOLEAN,
      defaultValue: true,
      validate: {
        notNull: true
      }
    }
  });
};