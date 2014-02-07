/**
 * Export for `sequelize.import` usage
 */

module.exports = function(sequelize, Types) {

  /**
   * Tag model
   *
   * A user specific group of tickets
   */

  return sequelize.define('Tag', {
    name: {
      type: Types.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },

    color: {
      type: Types.STRING,
      validate: {
        isColor: function(value) {
          return value.match(/#([a-f0-9]{3}|[a-f0-9]{6})/i);
        }
      }
    }
  });
};