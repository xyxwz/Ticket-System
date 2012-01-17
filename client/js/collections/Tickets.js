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

      this.bind('reset', this.loadAllComments);
      this.bind('add', this.loadComment);

      if (currentUser.role === 'admin') {
        this.mine = new Array();
        this.bind('reset', this.setMyTickets);
        this.bind('add', this.setMyTickets);
        this.bind('remove', this.setMyTickets);
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
    },

  });

  return Tickets;
});
