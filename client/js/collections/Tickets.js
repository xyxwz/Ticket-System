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

      /* Global EventEmitter bindings */
      ticketer.EventEmitter.on('ticket:update', this.updateTicket);
      ticketer.EventEmitter.on('ticket:remove', this.removeTicket);
      ticketer.EventEmitter.on('comment:new', this.addComment);
      ticketer.EventEmitter.on('comment:update', this.updateComment);
      ticketer.EventEmitter.on('comment:remove', this.removeComment);
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
    },

    /* Update attributes on a changed model */
    updateTicket: function(attrs) {
      var model = this.get(attrs.id);

      if(model) {
        model.set(model.parse(attrs));
      }
    },

    /* Destroy a ticket on the ticket:remove event */
    removeTicket: function(ticket) {
      var model = this.get(ticket);

      if(model) {
        model.destroy();
      }
    },

    /* Add a comment to the correct ticket on `comment:new` */
    addComment: function(attrs) {
      var model = this.get(attrs.ticket);

      if(model) {
        delete attrs.ticket;

        if(attrs.notification) {
          model.set({ 'notification': attrs.notification });
          delete attrs.notification;
        }

        model.comments.add(attrs);
      }
    },

    /* Update a comment on `comment:update` */
    updateComment: function(attrs) {
      var model = this.get(attrs.ticket);

      if(model) {
        delete attrs.ticket;

        if(attrs.notification) {
          model.set({ 'notification': attrs.notification });
          delete attrs.notification;
        }

        var comment = model.comments.get(attrs.id);
        comment.set(comment.parse(attrs));
      }
    },

    /* Remove a comment on `comment:remove` */
    removeComment: function(obj) {
      var model = this.get(obj.ticket);

      if(model) {
        var comment = model.comments.get(obj.comment);

        if(comment) comment.destroy();
      }
    }

  });

  return Tickets;
});
