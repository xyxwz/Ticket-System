/* TicketListView
 * Renders a collection of Tickets
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'timeline', 'views/tickets/TicketView', 'truncate'],
function($, _, Backbone, BaseView, Timeline, TicketView) {

  var TicketListView = BaseView.extend({

    events: {
      "click .ticketInfo": "showDetails"
    },

    initialize: function() {
      var self;

      self = this;
      _.bindAll(this);

      this.status = this.options.status ? this.options.status : 'open';

      this.filter = this.options.filter;

      this.bindTo(this.collection, 'add', function(model) {
        if(!self.filter) {
          var html = self.renderTicket(model);
          $(self.el).append(html);
        }
      });

      this.bindTo(this.collection, 'remove', function(model) {
        $('[data-id="' + model.id + '"]', self.el).remove();
      });

      this.bindTo(this.collection, 'reset', this.render);
      this.bindTo(this.collection, 'change:filters', this.changeFilter);
    },

    changeFilter: function() {
      var self = this;

      this.filter = function(thing) {
        // is the ticket's id in the filters? -> include it
        return ~self.collection.filters.indexOf(thing.id);
      };

      // Re-render with the new filter
      this.render();
    },

    render: function() {
      var self = this,
          view,
          collection;

      //Clear the element for clean render
      this.$el.empty();

      collection = typeof(this.filter) !== 'undefined' ? _(this.collection.filter(this.filter)) : this.collection;


      collection.each(function(ticket) {
        view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      if (this.status === 'closed') this.initTimeline();

      return this;
    },

    renderTicket: function(model) {
      var view, notify, html;

      notify = typeof(this.filter) !== 'undefined' ? true : false;

      view = this.createView(
        TicketView,
        {model: model, notify: notify}
      );

      html = view.render().el;
      $('.ticketInfo .ticketBody', html).truncate({max_length: 500});
      $('.ticketInfo', html).addClass('hover');

      return html;
    },

    initTimeline: function() {
      var self = this;

      if (this.collection.length === 0) return;

      this.timeline = new Timeline(this.collection, this.renderTicket, $(this.el), '.ticket', { status: this.status });
      this.bindTo($(window), 'scroll', function() { self.timeline.shouldCheckScroll = true ;});
      this.createInterval(250, function() { self.timeline.didScroll(); });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').data('id');
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    }

  });

  return TicketListView;
 });