/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',

    initialize: function() {

      this.comparator = function(model) {
        return model.get("opened_at");
      };

      var op = this;
      this.bind("reset", function() {

        op.each(function(ticket) {

          ticket.comments.fetch();

        });
      });

    },

  });

  return Tickets;
});
