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
        var date = new Date(model.get("opened_at"));
        return -date.getTime();
      };

      /* Global EventEmitter bindings */
      ticketer.EventEmitter.on('comment:new comment:update', this.addNotification);
      ticketer.EventEmitter.on('ticket:update', this.updateTicket);
      ticketer.EventEmitter.on('ticket:remove', this.removeTicket);
    },

    addNotification: function(data) {
      var obj = _.clone(data),
          model = this.get(obj.ticket);

      if(model && obj.notification) {
        model.set({notification: obj.notification});
      }
    },

    /* Update attributes on a changed model */
    updateTicket: function(attrs) {
      var obj = _.clone(attrs),
          model = this.get(obj.id);

      if(model) {
        model.set(model.parse(obj));
      }
    },

    /* Destroy a ticket on the ticket:remove event */
    removeTicket: function(ticket) {
      this.remove(ticket);
    }
  });

  return Tickets;
});
