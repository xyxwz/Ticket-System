define([
  'underscore',
  'backbone',
  'models/Ticket'
], function(_, Backbone, Ticket) {
  var Tickets;

  /**
   * Ticket collection, used for my tickets, open tickets, and closed tickets.
   * Only one will exist in memory at any given time.
   */

  Tickets = Backbone.Collection.extend({
    model: Ticket,

    initialize: function(models, options) {
      var noop = function() { return true; };

      options = options || {};

      this.url = options.url || '/api/tickets';
      this.data = options.data || {};
      this.collectionFilter = options.collectionFilter || noop;
      this.comparator = options.comparator || function(model) {
        var date = new Date(model.get("opened_at"));
        return -date.getTime();
      };

      /* Global EventEmitter bindings */
      ticketer.EventEmitter.on('comment:new comment:update', this.addNotification, this);
      ticketer.EventEmitter.on('ticket:new', this.newTicket, this);
      ticketer.EventEmitter.on('ticket:update', this.updateTicket, this);
      ticketer.EventEmitter.on('ticket:remove', this.removeTicket, this);
    },

    /**
     * Getter for internal status that is sent when
     *  fetching from server
     *
     * @return {String}
     */

    status: function() {
      return this.data.status || 'open';
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
          description: model.description,
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
     * Add a new ticket to the collection
     *
     * @param {Object} data
     */

    newTicket: function(data) {
      if(data.status === this.data.status && this.collectionFilter(data)) {
        this.add(data);
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

        if(this.data.status && model.get('status') !== this.data.status ||
           !this.collectionFilter(obj)) {
          this.remove(model.id);
        }
      } else {
        if(this.data.status && obj.status === this.data.status &&
           this.collectionFilter(obj)) {
          this.add(obj);
        }
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
