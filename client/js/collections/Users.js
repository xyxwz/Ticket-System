define([
  'underscore',
  'backbone',
  'models/User'
], function(_, Backbone, User) {
  var Users;

  /**
   * User Collection, loaded with bootstrapped data
   */

  Users = Backbone.Collection.extend({
    model: User,
    url: "/api/users",

    initialize: function() {

      this.comparator = function(model) {
        return model.get("name");
      };

    }
  });

  return Users;
});
