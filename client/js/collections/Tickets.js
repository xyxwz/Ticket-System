/* Ticket collection - used to represent a collection of
 * tickets */

define(['underscore', 'backbone', 'models/Ticket'], function(_, Backbone, Ticket) {

  var Tickets = Backbone.Collection.extend({
    model: Ticket,

    initialize: function(models, options) {
      options = options || {};

      this.url = options.url || '/api/tickets';
      this.data = options.data || {};
      this.comparator = options.comparator || function(model) {
        var date = new Date(model.get("opened_at"));
        return -date.getTime();
      };

      /* Global EventEmitter bindings */
      ticketer.EventEmitter.on('comment:new comment:update', this.addNotification, this);
      ticketer.EventEmitter.on('ticket:update', this.updateTicket, this);
      ticketer.EventEmitter.on('ticket:remove', this.removeTicket, this);
    },

    /**
     * Keep only the bare attributes we want to store in lists
     *
     * @param {Object} response
     */

    parse: function(response) {
      return response.map(function(model) {
        return {
          id: model.id,
          read: model.read,
          user: model.user,
          title: model.title,
          opened_at: model.opened_at,
          closed_at: model.closed_at,
          notification: model.notification,
          participating: model.participating
        };
      });
    },

    /**
     * Override the fetch function to provide status functionality
     *
     * @param {Object} options
     */

    fetch: function(options) {
      options = options || {};
      options.data = options.data || this.data;
      return Backbone.Collection.prototype.fetch.call(this, options);
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
        model.set(obj);
      }

      if(this.data && this.data.status &&
          model.get('status') !== this.data.status) {
        this.remove(model.id);
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
