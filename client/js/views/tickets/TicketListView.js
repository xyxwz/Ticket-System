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
    className: 'ticket-list scrollable',
    events: {
      "click .ticket": "showDetails"
    },

    initialize: function() {
      var self = this;

      _.bindAll(this);

      this.status = this.options.status ? this.options.status : 'open';
      this.filter = this.options.filter || function() { return true; };

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

    render: function() {
      var html,
          self = this;

      //Clear the element for clean render
      this.$el.empty();

      this.collection.each(function(ticket) {
        if(!self.filter(ticket)) return;

        html = self.renderTicket(ticket);
        $(self.el).append(html);
      });

      if(this.status === 'closed') this.initTimeline();

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
      var id = $(e.currentTarget).data('id');
      ticketer.routers.ticketer.navigate("tickets/" + id, true);
    }

  });

  return TicketListView;
 });