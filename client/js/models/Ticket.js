/* Ticket model - used to represent a single ticket object.
 *  - comments child, tickets have multiple comments */

define(['underscore', 'backbone', 'collections/Comments'], function(_, Backbone, Comments) {
  var Ticket = Backbone.Model.extend({

    defaults: {
      'status'  : 'Open'
    },

    urlRoot: '/api/tickets',

    initialize: function() {
      var self = this;

      _.bindAll(this);

      this.validate = this._validate;

      // Set an attribute for the socket.id
      ticketer.sockets.sock.on('connect', function() {
        self.set({socket: ticketer.sockets.id}, {silent: true});
      });

      this.set({socket: ticketer.sockets.id}, {silent: true});

      // Update attributes on changed model
      ticketer.EventEmitter.on('ticket:update', function(model) {
        if(model.id === self.id) {
          self.set(self.parse(model));
        }
      });

      this.comments = new Comments();
      this.comments.url = '/api/tickets/' + this.id + '/comments';

      // Add Comment
      ticketer.EventEmitter.on('comment:new', function(message) {
        if(message.ticket === self.id) {
          delete message.ticket;
          self.comments.add(message);

          if(message.notification) {
            self.set({ 'notification': message.notification });
          }
        }
      });

      this.on("change", function() {
        self.comments.url = '/api/tickets/' + this.id + '/comments';
      });

      /**
       * Set participating status on `open` tickets when a `assignedUser` of
       * `unassignedUser` event is triggered
       */

      if (this.get('status') === 'open') {
        this.on('assignedUser', function() {
          var assigned = _.include(self.get('assigned_to'), currentUser.id);
          if(assigned) self.set('participating', true);
        });

        this.on('unassignedUser', function() {
          var assigned = _.include(self.get('assigned_to'), currentUser.id);
          if(!assigned) self.set('participating', false);
        });
      }

      this.on('sync', function() {
        if(self.get('user').id === currentUser.id) self.set('participating', true);
      });

      this.comments.on('comments:add', function(comment) {
        if(comment.get('user').id === currentUser.id) self.set('participating', true);
      });

      this.on('error', function(model, err) {
        ticketer.EventEmitter.trigger('error', err);
      });

      // When a ticket is closed move it to the closed tickets collection
      this.on("change:status", function(model, status) {
        if(status === 'closed') {
          ticketer.collections.openTickets.remove(this);
          ticketer.collections.closedTickets.add(this);
        }
      });


    },

    /*
     * Returns if the user is participating in the ticket
     */
    participating: function() {
      if(this.get('participating') && this.get('participating') === true) {
        return true;
      }
      else {
        return false;
      }
    },

    /*
     * Returns if the user has a notification for the ticket
     */
    notification: function() {
      if(this.get('notification') && this.get('notification') === true) {
        return true;
      }
      else {
        return false;
      }
    },

    /*
     * Remove the notification from the ticket
     */
    removeNotification: function() {
      this.unset('notification');
      ticketer.EventEmitter.trigger('ticket:notification:remove', this.id);
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
        }

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
    }

  });

  return Ticket;
});
