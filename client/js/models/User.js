/**
 * User model
 */

define(['underscore', 'backbone'], function(_, Backbone) {
  var User = Backbone.Model.extend({
    urlRoot: '/api/tickets',

    initialize: function(attributes) {
      if(this.has('access_token')) {
        this.unset('access_token', { silent: true});
      }

      this.on('error', function() {
        ticketer.EventEmitter.trigger('error', "Error saving user");
      });
    },

    isAdmin: function() {
      return this.get('role') === 'admin';
    }
  });

  return User;
});