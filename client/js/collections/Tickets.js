/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',
    
    initialize: function() {

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      this.bind('add', this.loadComments);
      this.bind('reset', this.loadComments);

    },

    loadComments: function() {
      this.each(function(ticket) {
        ticket.comments.fetch();
      });
    },

  });

  return Tickets;
});
