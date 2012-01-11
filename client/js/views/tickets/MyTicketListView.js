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
      this.getMyTickets();
    },

    render: function() {
      var self = this;

      _.each(this.tickets, function(ticket) {
        var view = self.renderTicket(ticket);
        $(self.el).append(view);
      });

      return this;
    },

    getMyTickets: function() {
      var self = this;
      this.tickets = [];
      _.each(this.collection.assignedToMe, function(id) {
        var ticket = self.collection.get(id);
        self.tickets.push(ticket);
        self.bindTo(ticket, 'unassignedMe', self.removeTicket);
      });
    },

    renderTicket: function(model, page) {
      var view = this.createView(
        TicketView,
        {model: model, page: page}
      );

      this.page = page;

      return view.render().el;
    },

    removeTicket: function(model) {
      $("#id_"+model.id, this.el).fadeOut(300, function(){
        $(this).remove();
      });
    },

    showDetails: function(e) {
      var id = $(e.currentTarget).closest('.ticket').attr('id').split('id_')[1];
      ticketer.routers.ticketer.navigate("tickets/"+id, true);
    },

  });

  return TicketListView;
 });