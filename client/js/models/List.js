define(['underscore', 'backbone'], function(_, Backbone) {
  var List;

  List = Backbone.Model.extend({

    initialize: function() {
      _.bindAll(this);

      this.validate = this._validate;

      this.on('error', function(model, err) {
        ticketer.EventEmitter.trigger('error', err);
      });
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
        return "You must enter a task name.";
      }
    }

  });


  return List;
});