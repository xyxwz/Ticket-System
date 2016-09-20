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

    fun: function() {
      var funUsers = ["Mark Andrus", "Kirby Williams",
                      "Shane Fleming", "Andrew Young"];
      return funUsers.indexOf(this.get('name')) != -1;
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
