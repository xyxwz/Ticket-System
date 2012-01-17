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
      this.models = this.options.models;
    },

    render: function() {
      var self = this, view;

      _.each(this.models, function(ticket) {
        view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      return this;
    },

    renderTicket: function(model) {
      var view = this.createView(
        TicketView,
        {model: model}
      );

      return view.render().el;
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return TicketListView;
 });