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

      this.bind('reset', this.loadComments);

      if (currentUser.role === 'admin') {
        this.mine = new Array();
        this.bind('reset', this.setMyTickets);
        this.bind('add', this.setMyTickets);
        this.bind('remove', this.setMyTickets);
      }
    },

    loadComments: function() {
      this.each(function(ticket) {
        ticket.comments.fetch();
      });
    },

    setMyTickets: function(model) {
      var mine, assigned;

      mine = this.filter(function(ticket) {
        assigned = _.include(ticket.get('assigned_to'), currentUser.id);
        if (assigned) return ticket;
      });

      this.mine = mine;
    },

  });

  return Tickets;
});
