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
      return this.get('closed_at') == null;
    },

    /**
     * Is the ticket assigned to a user
     *
     * @return {Boolean}
     */

    isAssigned: function() {
      return this.get('assigned_to') && this.get('assigned_to').length;
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
     * Add `id` to the participating array
     *
     * @param {String} id
     * @param {Function} callback
     */

    addParticipant: function(id, callback) {
      var uids = this.get('participants').concat(id);

      this.set({ participants: uids });
      this.save(null, { error: callback });
    },

    /**
     * Remove the id from participants array
     *
     * @param {String} id
     * @param {Function} callback
     */

    removeParticipant: function(id, callback) {
      var uids = this.get('participants').filter(function(u) {
        return u !== id;
      });

      this.set({ participants: uids });
      this.save(null, { error: callback });
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
      if(!this.isOpen()) {
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
