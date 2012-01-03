/* User model - used to get the current user and store that 
 * information in memory. */

define(['underscore', 'backbone'], function(_, Backbone) {
  var User = Backbone.Model.extend({

    url: '/api/users',

  });

  return User;
});