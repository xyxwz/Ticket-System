/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',
    
    initialize: function() {
      _.bindAll(this);
      var self = this;

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      this.bind("add", this.syncMyTickets);
      this.bind('reset', this.loadComments);
    },

    loadComments: function() {
      this.each(function(ticket) {
        ticket.comments.fetch();
      });
    },

    syncMyTickets: function(model) {
      ticketer.collections.myTickets.checkAssigned(model);
      model.bind('assignedUser', ticketer.collections.myTickets.checkAssigned);
      model.bind('unassignedUser', ticketer.collections.myTickets.checkAssigned);
    },

  });

  Tickets.prototype.add = function(ticket) {
    var isDupe = this.any(function(_ticket) {
      return _ticket.id === ticket.id;
    });

    if (isDupe) {
      return;
    }

    Backbone.Collection.prototype.add.call(this, ticket);
  };

  return Tickets;
});
