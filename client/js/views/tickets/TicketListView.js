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
      var emitter = ticketer.EventEmitter;

      this.filters = [];
      this.controller = this.options.controller || null;

      // Bindings
      this.bindTo(this.collection, 'add', this.renderNew, this);
      this.bindTo(this.collection, 'reset', this.render, this);
      this.bindTo(this.collection, 'remove', this.renderRemove, this);
      this.bindTo(emitter, 'list:filter', this.pushFilter, this);
      this.bindTo(emitter, 'list:removeFilter', this.removeFilter, this);
      this.bindTo(emitter, 'collection:reset', this.refresh, this);
    },

    runFilters: function(ticket) {
      return this.filters.every(function(obj) {
        return obj.filter(ticket);
      });
    },

    /**
     * Push a filter to the internal filters array.
     *  Each context can only have one filter
     *
     * @param {Function} fn
     * @param {Object} context
     */

    pushFilter: function(fn, context) {
      var i = this.filters.length - 1,
          filters = this.filters;

      context = context || fn;

      while(i >= 0) {
        if(filters[i].context === context) filters.splice(i, 1);
        i = i - 1;
      }

      if(context !== fn) filters.push({filter: fn, context: context});
      this.render();
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
      var i, len, tickets, views = [];

      if(this.filters.length) {
        tickets = this.collection.filter(this.runFilters, this);
      }
      else {
        tickets = this.collection.models;
      }

      // Clean up children if any
      this.removeChildren();

      if(tickets.length) {
        this.$el.empty();

        for(i = 0, len = tickets.length; i < len; i = i + 1) {
          views.push(this.renderTicket(tickets[i]));
        }

        this.$el.append(views);
      } else {
        this.$el.html('<div class="view-filler"><p>No tickets to list</p></div>');
      }

      return this;
    },

    refresh: function() {
      this.collection.fetch({ reset: true });
    },

    renderTicket: function(model) {
      var view = this.createView(TicketView, {model: model});
      return view.render().el;
    },

    /**
     * Add a new ticket into its proper spot in the collection
     *
     * @param {Object} ticket
     */

    renderNew: function(ticket) {
      var i, len, view, temp, next;

      if(this.runFilters(ticket)) {
        view = this.renderTicket(ticket);

        for(i = 0, len = this.collection.length; i < len; i++) {
          if(this.collection.at(i).id === ticket.id) break;
        }

        if(i + 1 >= len) {
          this.$el.append(view);
        } else {
          sibling = this.$el.find('[data-id="' +
                      this.collection.at(i + 1).id + '"]');

          sibling.before(view);
        }
      }
    },

    /**
     * Remove a ticket from the view
     */

    renderRemove: function(ticket) {
      // Ensure there is length
      if(!this.collection.length) return this.render();

      this.removeView(function(view) {
        return view.$el.data('id') === ticket.id;
      });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).data('id'),
          ticket = this.collection.get(id);

      if(this.controller) this.controller.showTicket(ticket);
    },

    /**
     * Display the ticket as selected
     *  - panel controller's responsibility to invoke
     */

    selectTicket: function(id) {
      this.$el.find('.active').removeClass('active');
      this.$el.find('.ticket[data-id="' + id + '"]').addClass('active');
    }

  });

  return TicketListView;
 });
