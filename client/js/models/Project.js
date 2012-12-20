define(['underscore', 'backbone'], function(_, Backbone) {
  var Project;

  Project = Backbone.Model.extend({

    initialize: function() {
      _.bindAll(this);

      this.validate = this._validate;

      this.set({socket: ticketer.sockets.id}, {silent: true});

      this.on('error', function(model, err) {
        ticketer.EventEmitter.trigger('error', err);
      });
    },

    /**
     * Does this project contain `ticketId`?
     *
     * @param {String} ticketId
     */
    hasTicket: function(ticketId) {
      return !!~this.get('tickets').indexOf(ticketId);
    },

    /**
     * Push a ticket onto the project's tickets array
     *
     * @param{TicketObject} ticket the ticket id string/array to add to the project
     */
    addTicket: function(thing, callback) {
      var tickets = this.get('tickets');

      if(_.isArray(thing)) {
        _(thing).each(function(ticket) {
          if(!~tickets.indexOf(ticket)) {
            tickets.push(ticket);
          }
        });
      }
      else {
        if(!~tickets.indexOf(thing)) {
          tickets.push(thing);
        }
      }

      this.save(null, { error: callback });
      return this;
    },

    /**
     * Remove the ticket from the project's tickets array
     *
     * @param{TicketObject} ticket the ticket object/array to remove from the project
     */
    removeTicket: function(thing, callback) {
      var tickets = this.get('tickets');

      function slice(model) {
        var pos = tickets.indexOf(model.id);

        if(pos !== -1) {
          tickets.splice(pos, 1);
        }
      }

      if(_.isArray(thing)) {
        _(thing).each(function(model) {
          slice(model);
        });
      }
      else {
        slice(thing);
      }

      this.save(null, { error: callback });
      return this;
    },

    _validate: function(attrs) {
      if(typeof(attrs.name) !== 'undefined' && !attrs.name.replace(/\s/g, '').length) {
        return "You must enter a project name.";
      }
    }

  });


  return Project;
});