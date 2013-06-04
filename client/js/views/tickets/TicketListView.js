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
      this.filter = this.options.filter || function() { return true; };
      this._filter = this.filter; // Original filter
      this.controller = this.options.controller || null;
      this.collectionFilter = this.options.collectionFilter || function() { return true; };

      // The original filter and a filter function that is triggered with 'filter'
      function setFilter(fn) {
        var self = this;

        if(typeof fn === 'function') {
          this.filter = function(ticket) {
            return self._filter(ticket) && fn(ticket);
          };
        } else {
          this.filter = this._filter;
        }

        this.render();
      }

      // Bindings
      this.bindTo(this.collection, 'add remove reset', this.render, this);
      this.bindTo(ticketer.EventEmitter, 'list:filter', setFilter, this);
      this.bindTo(ticketer.EventEmitter, 'collection:reset', this.refresh, this);
      this.bindTo(ticketer.EventEmitter, 'ticket:new', this.newTicket, this);
    },

    /**
     * If a closed ticket collection destroy the collection on
     * view disposal.
     */

    dispose: function() {
      this.collection.destroy();
      delete this.collection;

      return BaseView.prototype.dispose.call(this);
    },

    render: function() {
      var i;
      var tickets = this.collection.filter(this.filter);
      var len = tickets.length;

      // Clean up children is any
      this.removeChildren();

      if(len) {
        this.$el.empty();

        for(i = 0; i < len; i = i + 1) {
          this.$el.append(this.renderTicket(tickets[i]));
        }

      } else {
        this.$el.html('<div class="view-filler"><p>No tickets to list</p></div>');
      }

      return this;
    },

    refresh: function() {
      this.collection.fetch();
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
    },

    newTicket: function(data) {
      if(data.status === this.status && this.collectionFilter(data))
        this.collection.add(data);
    }

  });

  return TicketListView;
 });