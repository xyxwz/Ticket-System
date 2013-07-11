/**
 * User model
 */

define(['underscore', 'backbone'], function(_, Backbone) {
  var User = Backbone.Model.extend({
    urlRoot: '/api/users',

    initialize: function(attributes) {
      this.on('invalid', function() {
        ticketer.EventEmitter.trigger('error', "Error saving user");
      });
    },

    isAdmin: function() {
      return this.get('role') === 'admin';
    },

    updateSettings: function(settings) {
      this.save({ settings: settings }, {
        success: function() {
          ticketer.EventEmitter.trigger('alert', 'Your settings have been saved.');
        }
      });
    }
  });

  return User;
});