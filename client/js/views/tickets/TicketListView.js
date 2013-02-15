/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView',
  'views/tickets/TicketView'],
function($, _, Backbone, BaseView, TicketView) {

  /**
   * TicketListView
   * Renders a collection of Tickets
   *
   * @param {Backbone.Collection} collection
   * @param {Function} filter
   * @param {String} status
   */

  var TicketListView = BaseView.extend({
    className: 'ticket-list',
    events: {
      "click .ticket": "showDetails"
    },

    initialize: function() {
      var self = this;

      _.bindAll(this);

      this.status = this.options.status ? this.options.status : 'open';
      this.filter = this.options.filter || function() { return true; };
      this._filter = this.filter; // Original filter
      this.controller = this.options.controller || null;

      // Bindings
      this.bindTo(this.collection, 'add remove reset', this.render);
      this.bindTo(this.collection, 'filter', function(fn) {
        if(typeof fn === 'function') {
          self.filter = function(ticket) {
            return self._filter(ticket) && fn(ticket);
          };
        } else {
          self.filter = self._filter;
        }

        self.render();
      });
    },

    render: function() {
      var i;
      var tickets = this.collection.filter(this.filter);
      var len = tickets.length;

      if(len) {
        this.$el.empty();

        for(i = 0; i < len; i = i + 1) {
          this.$el.append(this.renderTicket(tickets[i]));
        }

        if(this.status === 'closed') this.initTimeline();
      } else {
        this.$el.html('<div class="view-filler"><p>No tickets to list</p></div>');
      }

      return this;
    },

    renderTicket: function(model) {
      var view = this.createView(TicketView, {model: model});
      return view.render().el;
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).data('id'),
          ticket = this.collection.get(id);

      this.$el.find('.active').removeClass('active');
      this.$el.find('.ticket[data-id="' + id + '"]').addClass('active');

      if(this.controller)
        this.controller.showTicket(ticket);
    }

  });

  return TicketListView;
 });