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

    filter: function(name) {
      return _(this.models.filter(function(ticket) {
        return ticket.get(name) === true;
      }));
    }

  });

  return Tickets;
});
