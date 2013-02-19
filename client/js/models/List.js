define(['underscore', 'backbone'], function(_, Backbone) {
  var List;

  List = Backbone.Model.extend({

    initialize: function() {
      this.validate = this._validate;

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
     * @param{TicketObject} ticket the ticket object/array to add to the project
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
     * @param{String|Array} thing
     */
    removeTicket: function(thing, callback) {
      var tickets = this.get('tickets');

      function slice(id) {
        var pos = tickets.indexOf(id);

        if(pos !== -1) {
          tickets.splice(pos, 1);
        }
      }

      if(_.isArray(thing)) {
        _(thing).each(function(id) {
          slice(id);
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
        return "You must enter a task name.";
      }
    }

  });


  return List;
});