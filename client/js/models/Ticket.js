/* Ticket model - used to represent a single ticket object.
 *  - comments child, tickets have multiple comments */

define(['underscore', 'backbone', 'collections/Comments'], function(_, Backbone, Comments) {
  var Ticket = Backbone.Model.extend({
    urlRoot: '/api/tickets',

    initialize: function() {
      this.on('invalid', function() {
        ticketer.EventEmitter.trigger('error', "Error saving ticket");
      });
    },

    isOpen: function() {
      return this.get('closed_at') === void 0;
    },

    /*
     * Returns if the user has a notification for the ticket
     */

    notification: function() {
      return this.get('notification') && this.get('notification') === true;
    },

    /*
     * Remove the notification from the ticket
     */
    removeNotification: function() {
      this.unset('notification');
      ticketer.EventEmitter.trigger('notification:remove', this.id);
    },

    /* Validate the model to ensure that the title and body have content */
    validate: function(attrs) {
      if(typeof(attrs.title) !== 'undefined' && !attrs.title.replace(/ /g, '').length) {
        return "You must enter a ticket title.";
      }
      if(typeof(attrs.description) !== 'undefined' && !attrs.description.replace(/ /g, '').length) {
        return "You must enter a ticket description.";
      }
    },

    /* Updates the Ticket with the matching attributes
     * of the ticket argument, also takes a save error
     * callback. */
    updateTicket: function(ticket, callback) {
      if(ticket.title) this.set({ title: ticket.title });
      if(ticket.description) this.set({ description: ticket.description });
      if(ticket.status) this.set({ status: ticket.status });

      this.save(null, { error: callback });
    },

    /* Sets the Ticket's status to closed
     *    :callback - An error callback
     */
    close: function(callback) {
      this.save({ status: 'closed' }, {
        error: callback
      });
    },

    /**
     * Sets a user to participating
     */
    participate: function(id, callback) {
      var array = _.clone(this.get('participants'));
      array.push(id);
      this.set({participants: _.uniq(array)});
      this.save(null, { error: callback });
    },

    stopParticipating: function(id, callback) {
      var array = _.clone(this.get('participants'));
      var newArray = _.reject(array, function(user) {
        return user === id;
      });

      this.set({participants: _.uniq(newArray)});
      this.save(null, { error: callback });
    },

    follow: function() {
      var self = this,
          clone = _.clone(this);

      clone.url = "/api/tickets/" + clone.get('id') + '/follow';
      Backbone.sync("create", clone);
    },

    unfollow: function() {
      var self = this,
          clone = _.clone(this);

      clone.url = "/api/tickets/" + clone.get('id') + '/follow';
      Backbone.sync("delete", clone);
    },

    /**
     * Assign user with `id`
     *
     * @param {String} id
     */

    assignUser: function(id) {
      this.save({assigned_to: [id]});
    },

    /* If the ticket is closed take the difference of the created time,
     * and the closed time, and return a formatted string.
     */
    responseTime: function() {
      if(this.get('closed_at')) {
        var daysDiff, hourDiff, minDiff, secDiff,
            closed_at = new Date(this.get('closed_at')),
            opened_at = new Date(this.get('opened_at')),
            totalDiff = closed_at.getTime() - opened_at.getTime();
        daysDiff = Math.floor(totalDiff/1000/60/60/24);
        totalDiff -= daysDiff * 1000 * 60 * 60 * 24;
        hourDiff = Math.floor(totalDiff/1000/60/60);
        totalDiff -= hourDiff * 1000 * 60 * 60;
        minDiff = Math.floor(totalDiff/1000/60);

        return daysDiff.toString() + ' days, ' + hourDiff.toString() + ' hours, ' + minDiff.toString() + ' minutes';
      }

      return false;
    }

  });

  return Ticket;
});
