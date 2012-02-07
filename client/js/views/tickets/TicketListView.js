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
        if(!this.filter) {
          var html = self.renderTicket(model);
          $(self.el).append(html);
        }
      });

      this.bindTo(this.collection, 'remove', function(model) {
        $('#id_'+model.id, self.el).remove();
      });

      this.bindTo(this.collection, 'reset', this.render);
    },

    render: function() {
      var self = this,
          view,
          collection;

      collection = typeof(this.filter) != 'undefined' ? this.collection.filter(this.filter) : this.collection;

      collection.each(function(ticket) {
        view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      if (this.status === 'closed') this.initTimeline();

      return this;
    },

    renderTicket: function(model) {
      var view, html;

      view = this.createView(
        TicketView,
        {model: model}
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
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    }

  });

  return TicketListView;
 });