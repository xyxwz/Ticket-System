/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',
    
    initialize: function() {
      var self = this;

      _.bindAll(this);

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      this.page = 1;

      this.on('reset', this.loadAllComments);
      this.on('add', this.loadComment);

      if (currentUser.role === 'admin') {
        this.mine = [];
        this.on('reset', this.setMyTickets);
        this.on('add', this.setMyTickets);
        this.on('remove', this.setMyTickets);
      }
    },

    loadAllComments: function() {
      var self = this;

      this.each(function(ticket) {
        self.loadComment(ticket);
      });
    },

    loadComment: function(model) {
      model.comments.fetch();
    },

    setMyTickets: function(model) {
      var mine, assigned;

      mine = this.filter(function(ticket) {
        assigned = _.include(ticket.get('assigned_to'), currentUser.id);
        if (assigned) return ticket;
      });

      this.mine = mine;
    }

  });

  return Tickets;
});
