/* User collection - used to represent all users */
  
define(['underscore', 'backbone', 'models/user'], function(_, Backbone, User) {
  var Users = Backbone.Collection.extend({

    model: User,

    initialize: function() {

    },

  });

  return Users;
});
