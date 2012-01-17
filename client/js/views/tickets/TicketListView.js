/* TicketListView
 * Renders a collection of Tickets
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'timeline', 'views/tickets/TicketView'],
function($, _, Backbone, BaseView, Timeline, TicketView) {

  var TicketListView = BaseView.extend({

    events: {
      "click .ticketInfo": "showDetails",
    },

    initialize: function() {
      var self;

      self = this;
      _.bindAll(this);

      this.models = this.options.models;
      this.status = this.options.status ? this.options.status : 'open';
    },

    render: function() {
      var self = this, view;

      _.each(this.models, function(ticket) {
        view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      if (this.status === 'closed') this.initTimeline();

      return this;
    },

    renderTicket: function(model) {
      var view = this.createView(
        TicketView,
        {model: model}
      );

      return view.render().el;
    },

    initTimeline: function() {
      var self = this;

      if (this.collection.length === 0) return;

      this.timeline = new Timeline(this.collection, this.renderTicket, $(this.el), '.ticket', { status: this.status });
      this.bindTo($(window), 'scroll', function() { self.timeline.shouldCheckScroll = true });
      this.createInterval(250, function() { self.timeline.didScroll() });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return TicketListView;
 });