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
      _.bindAll(this);
      this.page = 1;
      this.bindTo(this, 'timeline', this.initTimeline);
    },

    render: function() {
      var self = this,
          i = 0;

      _.each(this.collection.models, function(ticket) {
        if (i < 10) { i++; }
        else {
          self.page++;
          i = 0;
        }
        var view = self.renderTicket(ticket, self.page);
        $(self.el).append(view);
      });

      return this;
    },

    initTimeline: function() {
      var self = this;
      this.timeline = new Timeline(this.collection, this.renderTicket, $(this.el), '.ticket');
      this.bindTo($(window), 'scroll', function() { self.timeline.shouldCheckScroll = true });
      this.createInterval(250, function() { self.timeline.didScroll() });
    },

    renderTicket: function(model, page) {
      var view = this.createView(
        TicketView,
        {model: model, page: page}
      );

      this.page = page;

      //$(this.el).append(view.render().el);
      return view.render().el;
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return TicketListView;
 });