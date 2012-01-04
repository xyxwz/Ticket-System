/* User collection - used to represent all users */
  
define(['underscore', 'backbone', 'models/user'], function(_, Backbone, User) {
  var Users = Backbone.Collection.extend({

    model: User,

    initialize: function() {

      this.comparator = function(model) {
        return model.get("name");
      };

    },

    admins: function() {
      var admins = this.filter(function(model) {
        return model.get('role') === 'admin';
      });
      return admins;
    },

  });

  return Users;
});
