/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'timeline',
  'views/tickets/TicketView'],
function($, _, Backbone, BaseView, Timeline, TicketView) {

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

      // Save reference to original filter
      this._filter = this.filter;

      this.bindTo(this.collection, 'add', function(model) {
        if(self.filter(model)) {
          var html = self.renderTicket(model);
          $(self.el).append(html);
        }
      });

      this.bindTo(this.collection, 'remove', function(model) {
        $('[data-id="' + model.id + '"]', self.el).remove();
      });

      this.bindTo(this.collection, 'reset', this.render);
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
      var html = [];
      var tickets = this.collection.filter(this.filter);
      var len = tickets.length;

      if(len) {
        for(i = 0; i < len; i = i + 1) {
          html.push(this.renderTicket(tickets[i]).outerHTML);
        }

        this.$el.html(html.join(''));
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

    initTimeline: function() {
      var self = this;

      if (this.collection.length === 0) return;

      this.timeline = new Timeline(this.collection, this.renderTicket, $(this.el), '.ticket', { status: this.status });
      this.bindTo($(window), 'scroll', function() { self.timeline.shouldCheckScroll = true ;});
      this.createInterval(250, function() { self.timeline.didScroll(); });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).data('id'),
          ticket = this.collection.get(id);

      this.$el.find('.active').removeClass('active');
      this.$el.find('.ticket[data-id="' + id + '"]').addClass('active');

      ticketer.controller.showTicket(ticket);
    }

  });

  return TicketListView;
 });