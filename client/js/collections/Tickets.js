/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {
  var Tickets = Backbone.Collection.extend({

    model: Ticket,
    url: '/api/tickets',

    initialize: function() {

      this.comparator = function(model) {
        var date = new Date(model.get("opened_at"));
        return -date.getTime();
      };

      /* Global EventEmitter bindings */
      ticketer.EventEmitter.on('comment:new comment:update', this.addNotification, this);
      ticketer.EventEmitter.on('ticket:update', this.updateTicket, this);
      ticketer.EventEmitter.on('ticket:remove', this.removeTicket, this);
    },

    /**
     * Reset the collection and clear all global event bindings
     */

    destroy: function() {
      this.reset();
      ticketer.EventEmitter.off(null, null, this);
      return null;
    },

    /**
     * Add a notification to ticket with id `data.ticket`
     *
     * @param {Object} data
     */

    addNotification: function(data) {
      var obj = _.clone(data),
          model = this.get(obj.ticket);

      if(model && obj.notification) {
        model.set({notification: obj.notification});
      }
    },

    /**
     * Update the ticket with id `attrs.id` if found in the collection
     *
     * @param {Object} attrs
     */

    updateTicket: function(attrs) {
      var obj = _.clone(attrs),
          model = this.get(obj.id);

      if(model) {
        model.set(model.parse(obj));
      }
    },

    /**
     * Remove the ticket with id `ticket` if in this collection
     *
     * @param {String} ticket
     */

    removeTicket: function(ticket) {
      this.remove(ticket);
    }
  });

  return Tickets;
});
