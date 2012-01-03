/* Ticket model - used to represent a single ticket object.
 *  - comments child, tickets have multiple comments */

define(['underscore', 'backbone', 'collections/comments'], function(_, Backbone, Comments) {
  var Ticket = Backbone.Model.extend({

    //url: '/api/tickets',
    
    defaults: {
      'status'  : 'Open',
    },

    initialize: function() {

      this.comments = new Comments();
      this.comments.url = '/api/tickets/' + this.id + '/comments';

      var op = this;
      this.bind("change", function() {

        op.comments.url = '/api/tickets/' + this.id + '/comments';

      });

    },
    
    /* Updates the Ticket with the matching attributes
     * of the ticket argument, also takes a save error
     * callback. */
    updateTicket: function(ticket, callback) {

      if (ticket.title) {
        this.set({ title: ticket.title });
      }
      if (ticket.description) {
        this.set({ description: ticket.description });
      }
      if (ticket.status) {
        this.set({ status: ticket.status });
      }

      this.save(null, { error: callback });

    },

    /* Sets the Ticket's status to closed */
    close: function(callback) {
      var self = this;

      this.set({ status: 'closed' });
      this.save(null, {
        error: callback,
        success: function() {
          // Handles Switching Collections
          ticketer.collections.openTickets.remove(self);
          ticketer.collections.closedTickets.add(self);
        },

      });

    },

  });
  
  return Ticket;  
}); 
