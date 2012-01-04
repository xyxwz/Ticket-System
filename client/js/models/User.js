/* User model - used to get the current user and store that 
 * information in memory. */

define(['underscore', 'backbone'], function(_, Backbone) {
  var User = Backbone.Model.extend({

    url: '/api/users',

    initialize: function() {
      this.createShortName();
      this.bind('change:name', this.createShortName);
    },

    createShortName: function() {
      var str = this.get('name').split(' ')[0];
      this.set({shortname:str});
    },

  });

  return User;
});