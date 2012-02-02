/* Ticket model - used to represent a single ticket object.
 *  - comments child, tickets have multiple comments */

define(['underscore', 'backbone', 'collections/Comments'], function(_, Backbone, Comments) {
  var Ticket = Backbone.Model.extend({
    
    defaults: {
      'status'  : 'Open',
    },

    urlRoot: '/api/tickets',

    initialize: function() {
      var self = this;

      _.bindAll(this);

      this.validate = this._validate;

      this.comments = new Comments();
      this.comments.url = '/api/tickets/' + this.id + '/comments';

      this.bind("change", function() {
        self.comments.url = '/api/tickets/' + this.id + '/comments';
      });

      if (this.get('status') === 'open') {
        this.bind('assignedUser', this.collection.setMyTickets);
        this.bind('unassignedUser', this.collection.setMyTickets);
      }

      this.on('error', function(model, err) {
        ticketer.EventEmitter.trigger('error', err);
      });

    },

    /* Validate the model to ensure that the title and body have content */
    _validate: function(attrs) {
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

      if (ticket.title) this.set({ title: ticket.title });
      if (ticket.description) this.set({ description: ticket.description });
      if (ticket.status) this.set({ status: ticket.status });

      this.save(null, { error: callback });
    },

    /* Sets the Ticket's status to closed
     *    :callback - An error callback
     */
    close: function(callback) {
      var self = this;

      this.save({ status: 'closed' }, {
        error: callback,
        success: function() {
          self.unbind('assignedUser', self.collection.setMyTickets);
          self.unbind('unassignedUser', self.collection.setMyTickets);
          // Handles Switching Collections
          ticketer.collections.openTickets.remove(self);
          ticketer.collections.closedTickets.add(self);
        },

      });

    },

    /* Assigns a User to the ticket
     *    :id       -  A user model id to assign
     *    :callback - An error callback
     */
    assignUser: function(id, callback) {
      var array = _.clone(this.get('assigned_to'));
      array.push(id);
      this.set({assigned_to: _.uniq(array)}, {silent: true});
      this.trigger('assignedUser', this);
      this.save(null, { error: callback });
    },

    /* Unassign a User from the ticket
     *    :id       - A user model id to remove
     *    :callback - An error callback
     */
    unassignUser: function(id, callback) {
      var array = _.clone(this.get('assigned_to'));
      var newArray = _.reject(array, function(user) {
        return user === id;
      });
      this.set({assigned_to: _.uniq(newArray)}, {silent: true});
      this.trigger('unassignedUser', this);
      this.save(null, { error: callback });
    },

  });
  
  return Ticket;  
}); 
