/* User collection - used to represent all users */
  
define(['underscore', 'backbone', 'models/User'], function(_, Backbone, User) {
  var Users = Backbone.Collection.extend({

    model: User,

    initialize: function() {

      this.comparator = function(model) {
        return model.get("name");
      };

    }

  });

  return Users;
});
