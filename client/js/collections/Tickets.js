/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',
    
    initialize: function() {
      _.bindAll(this);
      var self = this;

      this.currentUser = currentUser.id;
      this.assignedToMe = [];

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      this.bind("reset", function() {
        _.each(self.models, function(model){
          self.trigger("add", model);
        });
      });

      this.bind("add", this.assignMe);
      this.bind("remove", this.unassignMe);

      this.bind('reset', this.loadComments);
    },

    loadComments: function() {
      this.each(function(ticket) {
        ticket.comments.fetch();
      });
    },

    assignMe: function(model) {
      var self = this,
          id = model.id;

      _.each(model.get('assigned_to'), function(user) {
        if(user === self.currentUser) {
          if(!_.include(self.assignedToMe, id)) {
            self.assignedToMe.push(id);
          }
        }
      });
    },

    unassignMe: function(model) {
      var self = this,
          id = model.id;

      if(_.include(self.assignedToMe, id)) {
        idx = _.indexOf(this.assignedToMe, id);
        this.assignedToMe.splice(idx, 1);
      }
    },

  });

  return Tickets;
});
