/* MyTickets collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var MyTickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',

    initialize: function() {
      _.bindAll(this);
      var self = this;

      this.currentUser = currentUser.id;

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      this.bind('reset', this.loadComments);
    },

    loadComments: function() {
      this.each(function(ticket) {
        ticket.comments.fetch();
      });
    },

    checkAssigned: function(model) {
      var self = this, array, includesMe, included;

      includesMe = _.any(model.get('assigned_to'), function(user) {
        return user === self.currentUser;
      });

      if(includesMe) {
        included = this.get(model.id);
        if (!included)  {
          self.add(model);
        }
      } 
      else {
        included = this.get(model.id);
        if (included) {
          self.remove(model.id);
        }
      }
    },

  });

  MyTickets.prototype.add = function(ticket) {
    var isDupe = this.any(function(_ticket) {
      return _ticket.id === ticket.id;
    });

    if (isDupe) {
      return;
    }

    Backbone.Collection.prototype.add.call(this, ticket);
  };

  return MyTickets;
});
